#!/usr/bin/env node
/*
 * Renders the reel frame-by-frame in headless Chromium and pipes PNGs to ffmpeg.
 *
 *   NODE_PATH=$(npm root -g) node render.cjs --w 1920 --h 1080 --out reel.mp4
 *   NODE_PATH=$(npm root -g) node render.cjs --stills 0.3,1.2,2.8 --outdir stills
 *
 * Flags: --w --h --fps (60) --samples (motion-blur sub-frames, 8)
 *        --out <file.mp4|file.webm> --ffmpeg <path> --stills <t,t,..> --outdir
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const W = +arg("w", 1920);
const H = +arg("h", 1080);
const FPS = +arg("fps", 60);
const SAMPLES = +arg("samples", 8);
const OUT = arg("out");
const FFMPEG = arg("ffmpeg", "ffmpeg");
const STILLS = arg("stills");
const OUTDIR = arg("outdir", "stills");

const root = __dirname;
const types = { ".html": "text/html", ".js": "text/javascript", ".ttf": "font/ttf" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

function encoderArgs(out) {
  if (out.endsWith(".webm"))
    return ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-row-mt", "1", "-pix_fmt", "yuv420p"];
  return ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("page error:", e));
  await page.goto(`http://localhost:${port}/index.html?export&w=${W}&h=${H}`);
  await page.waitForFunction(() => window.reelReady === true);
  const dur = await page.evaluate(() => REEL.DUR);
  const canvas = await page.$("canvas");

  if (STILLS) {
    fs.mkdirSync(OUTDIR, { recursive: true });
    for (const t of STILLS.split(",").map(Number)) {
      await page.evaluate(([t, s]) => renderAt(t, s), [t, SAMPLES]);
      await canvas.screenshot({ path: path.join(OUTDIR, `t${t.toFixed(2)}.png`) });
    }
  }

  if (OUT) {
    const ff = spawn(
      FFMPEG,
      ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", ...encoderArgs(OUT), OUT],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
    const frames = Math.round(dur * FPS);
    for (let f = 0; f < frames; f++) {
      await page.evaluate(([t, s]) => renderAt(t, s), [f / FPS, SAMPLES]);
      const png = await canvas.screenshot({ type: "png" });
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
      if (f % 30 === 0) process.stderr.write(`frame ${f}/${frames}\n`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
  }

  await browser.close();
  server.close();
})();
