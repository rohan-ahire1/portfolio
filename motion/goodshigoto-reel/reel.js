/*
 * GoodShigoto — landing reel.
 *
 * One deterministic function of time: draw(t) paints the frame at t seconds.
 * The same code plays live in the browser (index.html) and renders the
 * master video frame-by-frame (render.cjs), with optional motion blur.
 *
 * Brand (from goodshigoto.com): paper #f5f2eb, ink #141311, red #c8321f,
 * Schibsted Grotesk 800 at -0.045em, IBM Plex Mono, red i-dots and full
 * stops, the red hand-drawn underline, and the ensō / mountain / sun mark.
 *
 * Beats (seconds):
 *   0.00  IMPULSE     the red sun springs in, squashes, shoots into a line
 *   0.58  TYPE        line splits into a band; Websites. → … → Properly.
 *   1.80  SYSTEMS     band slams shut, line breaks into a dot grid, ripple
 *   2.55  FORM        dots fly into a halftone of the mark, resolve to solid
 *   3.18  TRANSITION  zoom through the sun into pure red
 *   3.52  LOCKUP      layered wipes, ensō draws itself, GoodShıgoto, the
 *                     i-dot drops in, "We redesign websites. Properly."
 *   4.75  hold        clean end frame
 */
(function () {
  "use strict";

  const C = {
    paper: "#f5f2eb",
    ink: "#141311",
    red: "#c8321f",
    muted: "#4a453e",
    soft: "#6e685e",
    line: "#dcd6cb",
  };
  const RGB = { paper: [245, 242, 235], ink: [20, 19, 17], red: [200, 50, 31] };
  const DUR = 5.0;
  const FPS = 60;

  const F_SANS = '"Schibsted Grotesk"';
  const F_MONO = '"IBM Plex Mono"';
  const TRACK = -0.045; // em, .wordmark on the site
  const TRACK_H = -0.035; // em, the site's headings

  const WORDS = [
    { w: "Websites.", t: 0.62 },
    { w: "Redesigned.", t: 1.12 },
    { w: "Software.", t: 1.26 },
    { w: "Automations.", t: 1.4 },
    { w: "Properly.", t: 1.54 },
  ];
  const BAND_CLOSE = 1.8;

  const SCENES = [
    [0.0, "01 — IMPULSE"],
    [0.58, "02 — TYPE"],
    [1.95, "03 — SYSTEMS"],
    [2.55, "04 — FORM"],
    [3.18, "05 — TRANSITION"],
  ];

  // The site's hero underline, viewBox 0 0 420 40.
  const UNDERLINE = [
    [
      [6, 24],
      [90, 12],
      [230, 8],
      [414, 18],
    ],
    [
      [30, 34],
      [140, 26],
      [260, 26],
      [380, 30],
    ],
  ];

  // ---------------------------------------------------------------- math

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const E = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inQuad: (t) => t * t,
    inQuart: (t) => t * t * t * t,
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) =>
      t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  };
  // Damped spring settling to 1; dt in seconds.
  const spring = (dt, freq = 3.2, damp = 9) =>
    dt <= 0 ? 0 : 1 - Math.exp(-damp * dt) * Math.cos(2 * Math.PI * freq * dt);
  // Decaying wobble around 0, for impacts and punches.
  const wobble = (dt, freq = 5, damp = 14) =>
    dt <= 0 ? 0 : Math.exp(-damp * dt) * Math.cos(2 * Math.PI * freq * dt);
  const hash = (a, b = 0) => {
    let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
    return (h >>> 0) / 4294967296;
  };
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const mixArr = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgb = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

  // ---------------------------------------------------------------- mark

  // The logo PNG split into three recoloured layers — ensō, mountain, sun —
  // so each can animate on its own.
  let MARK = null;

  function processMark(img) {
    const w = img.naturalWidth,
      h = img.naturalHeight;
    const src = document.createElement("canvas");
    src.width = w;
    src.height = h;
    const sc = src.getContext("2d", { willReadFrequently: true });
    sc.drawImage(img, 0, 0);
    const d = sc.getImageData(0, 0, w, h).data;
    const n = w * h;
    const isRed = (p) => d[p * 4 + 3] > 16 && d[p * 4] - d[p * 4 + 1] > 60;
    const ink = new Uint8Array(n);
    for (let p = 0; p < n; p++) if (d[p * 4 + 3] > 16 && !isRed(p)) ink[p] = 1;

    // Seed on the mountain's right arm, flood-fill it out of the ink.
    const sx = 0.76 * w,
      sy = 0.6 * h;
    let seed = -1,
      best = Infinity;
    for (let p = 0; p < n; p++) {
      if (!ink[p] || d[p * 4 + 3] < 200) continue;
      const dx = (p % w) - sx,
        dy = Math.floor(p / w) - sy;
      const dd = dx * dx + dy * dy;
      if (dd < best) {
        best = dd;
        seed = p;
      }
    }
    const chev = new Uint8Array(n);
    const stack = [seed];
    chev[seed] = 1;
    while (stack.length) {
      const p = stack.pop();
      const x = p % w,
        y = (p / w) | 0;
      for (let oy = -1; oy <= 1; oy++)
        for (let ox = -1; ox <= 1; ox++) {
          const nx = x + ox,
            ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (ink[q] && !chev[q]) {
            chev[q] = 1;
            stack.push(q);
          }
        }
    }

    const layer = (pick, col) => {
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const c = cv.getContext("2d");
      const out = c.createImageData(w, h);
      for (let p = 0; p < n; p++) {
        if (!pick(p)) continue;
        out.data[p * 4] = col[0];
        out.data[p * 4 + 1] = col[1];
        out.data[p * 4 + 2] = col[2];
        out.data[p * 4 + 3] = d[p * 4 + 3];
      }
      c.putImageData(out, 0, 0);
      return cv;
    };

    // Sun centre + radius; ensō bbox + the angular gap in the ring.
    let rx = 0,
      ry = 0,
      ra = 0;
    let x0 = w,
      y0 = h,
      x1 = 0,
      y1 = 0;
    for (let p = 0; p < n; p++) {
      const x = p % w,
        y = (p / w) | 0;
      if (isRed(p)) {
        const a = d[p * 4 + 3] / 255;
        rx += x * a;
        ry += y * a;
        ra += a;
      } else if (ink[p] && !chev[p] && d[p * 4 + 3] > 128) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
    const ecx = (x0 + x1) / 2,
      ecy = (y0 + y1) / 2;
    const bins = new Float32Array(360);
    const R = Math.min(x1 - x0, y1 - y0) / 2;
    for (let p = 0; p < n; p++) {
      if (!ink[p] || chev[p] || d[p * 4 + 3] < 128) continue;
      const dx = (p % w) - ecx,
        dy = ((p / w) | 0) - ecy;
      if (dx * dx + dy * dy < R * R * 0.5) continue;
      const a = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      bins[Math.floor(a)]++;
    }
    // Longest circular run of near-empty bins = the opening of the ensō.
    let runStart = 0,
      runLen = 0,
      bestStart = 0,
      bestLen = 0;
    for (let i = 0; i < 720; i++) {
      if (bins[i % 360] < 3) {
        if (runLen === 0) runStart = i;
        runLen++;
        if (runLen > bestLen) {
          bestLen = runLen;
          bestStart = runStart;
        }
      } else runLen = 0;
    }
    const gapEnd = ((bestStart + bestLen) % 360) * (Math.PI / 180);
    const gapStart = (bestStart % 360) * (Math.PI / 180);

    MARK = {
      w,
      h,
      enso: layer((p) => ink[p] && !chev[p], RGB.ink),
      chev: layer((p) => chev[p], RGB.ink),
      sunX: rx / ra,
      sunY: ry / ra,
      sunR: Math.sqrt(ra / Math.PI),
      enso0: { x: ecx, y: ecy, a0: gapEnd, a1: gapStart + (gapStart < gapEnd ? Math.PI * 2 : 0) },
    };
  }

  // Place the mark by its height; returns the mapping from mark px → canvas.
  function markRect(cx, cy, height) {
    const s = height / MARK.h;
    return { x: cx - (MARK.w * s) / 2, y: cy - height / 2, s, w: MARK.w * s, h: height };
  }
  const mp = (r, x, y) => [r.x + x * r.s, r.y + y * r.s];

  // The sun is drawn as a true circle so it stays crisp at any zoom.
  function drawSun(ctx, r) {
    const [x, y] = mp(r, MARK.sunX, MARK.sunY);
    ctx.fillStyle = C.red;
    ctx.beginPath();
    ctx.arc(x, y, MARK.sunR * r.s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMark(ctx, r, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(MARK.enso, r.x, r.y, r.w, r.h);
    ctx.drawImage(MARK.chev, r.x, r.y, r.w, r.h);
    drawSun(ctx, r);
    ctx.globalAlpha = 1;
  }

  // --------------------------------------------------------------- setup

  let L = null; // layout, rebuilt per canvas size
  const scratch = document.createElement("canvas").getContext("2d");
  const measure = (text, font) => {
    scratch.font = font;
    return scratch.measureText(text);
  };
  // Glyph x-positions for a tracked string (keeps kerning via prefixes).
  function tracked(text, font, size, track = TRACK_H) {
    const ls = track * size;
    const chars = [...text];
    const xs = chars.map((_, j) => measure(chars.slice(0, j).join(""), font).width + j * ls);
    const width = measure(text, font).width + (chars.length - 1) * ls;
    return { chars, xs, width };
  }
  const sans = (px) => `800 ${px}px ${F_SANS}`;

  function setup(W, H) {
    const u = Math.min(W, H) / 1080;
    const portrait = H > W;
    L = { W, H, u, portrait, cx: W / 2, cy: H / 2 };

    // Scene A
    L.R0 = 62 * u;
    L.lineH = 8 * u;

    // Scene B — word band
    L.bandH = 250 * u;
    let widest = 0;
    for (const w of WORDS) widest = Math.max(widest, tracked(w.w, sans(100), 100).width);
    L.wordFs = Math.min(300 * u, ((portrait ? 0.84 : 0.8) * W) / widest * 100);
    L.wordFont = sans(L.wordFs);
    L.wordX = measure("x", L.wordFont).actualBoundingBoxAscent;
    L.wordCap = measure("H", L.wordFont).actualBoundingBoxAscent;
    L.wordBase = L.cy + L.wordCap / 2 - L.wordFs * 0.03;
    L.words = WORDS.map((w) => {
      const tr = tracked(w.w, L.wordFont, L.wordFs);
      const x0 = L.cx - tr.width / 2;
      return { ...w, ...tr, xs: tr.xs.map((x) => x0 + x), x0 };
    });

    // Scene C — grid
    L.cols = portrait ? 18 : 32;
    L.rows = Math.round((L.cols * H) / W);
    L.N = L.cols * L.rows;
    L.sp = W / L.cols;
    L.rDot = L.sp * 0.2;

    // Scene C/D — big mark, halftone targets, zoom focal
    const bigH = portrait ? Math.min(W * 0.72, H * 0.4) : Math.min(H * 0.64, W * 0.4);
    L.big = markRect(L.cx, L.cy, bigH);
    buildHalftone();
    const [fx, fy] = mp(L.big, MARK.sunX, MARK.sunY);
    L.focal = { x: fx, y: fy };

    // Scene E — lockup
    const lk = {};
    if (portrait) {
      lk.fs = W * 0.128;
      lk.font = sans(lk.fs);
      lk.cap = measure("H", lk.font).actualBoundingBoxAscent;
      lk.base = L.cy + lk.fs * 0.3;
      lk.word = tracked("GoodShigoto", lk.font, lk.fs, TRACK);
      lk.wx = L.cx - lk.word.width / 2;
      lk.mark = markRect(L.cx, lk.base - lk.cap - lk.fs * 1.35, W * 0.34);
      lk.tagFs = Math.min(lk.fs * 0.36, (W * 0.84) / tracked("We redesign websites. Properly.", sans(100), 100).width * 100);
      lk.tagBase = lk.base + lk.fs * 0.95;
    } else {
      lk.fs = Math.min(W * 0.088, H * 0.17);
      lk.font = sans(lk.fs);
      lk.cap = measure("H", lk.font).actualBoundingBoxAscent;
      lk.word = tracked("GoodShigoto", lk.font, lk.fs, TRACK);
      const mh = lk.fs * 1.3;
      const mw = mh * (MARK.w / MARK.h);
      const gap = lk.fs * 0.3;
      const rowW = mw + gap + lk.word.width;
      const left = L.cx - rowW / 2;
      lk.base = L.cy + lk.cap / 2 - lk.fs * 0.28;
      lk.mark = markRect(left + mw / 2, lk.base - lk.cap / 2, mh);
      lk.wx = left + mw + gap;
      lk.tagFs = lk.fs * 0.34;
      lk.tagBase = lk.base + lk.fs * 1.0;
    }
    lk.wxs = lk.word.xs.map((x) => lk.wx + x);
    // i-dot: 0.21em red disc, top aligned with the natural i tittle.
    const iIdx = lk.word.chars.indexOf("i");
    const mi = measure("ı", lk.font);
    lk.iIdx = iIdx;
    lk.dot = {
      r: lk.fs * 0.105,
      x: lk.wxs[iIdx] + (mi.actualBoundingBoxRight - mi.actualBoundingBoxLeft) / 2 - mi.actualBoundingBoxLeft,
      y: lk.base - measure("i", lk.font).actualBoundingBoxAscent + lk.fs * 0.105,
    };
    // Tagline split into words so they can rise one by one.
    lk.tagFont = sans(lk.tagFs);
    const tag = tracked("We redesign websites. Properly.", lk.tagFont, lk.tagFs);
    const tx0 = L.cx - tag.width / 2;
    lk.tag = [];
    let cur = null;
    tag.chars.forEach((ch, j) => {
      if (ch === " ") {
        cur = null;
        return;
      }
      if (!cur) lk.tag.push((cur = { chars: [], xs: [] }));
      cur.chars.push(ch);
      cur.xs.push(tx0 + tag.xs[j]);
    });
    const prop = lk.tag[lk.tag.length - 1];
    lk.under = { x: prop.xs[0], w: tx0 + tag.width - prop.xs[0], y: lk.tagBase };
    lk.metaFs = (portrait ? 20 : 17) * u;
    lk.metaY = H - (portrait ? 110 : 64) * u;
    lk.mx = portrait ? W * 0.08 : W * 0.06;
    L.lk = lk;
    return L;
  }

  // Sample the mark into exactly N hex-packed points, each with its colour.
  function buildHalftone() {
    const { W, H } = L;
    const sc = 0.5;
    const mw = Math.ceil(W * sc),
      mh = Math.ceil(H * sc);
    const cv = document.createElement("canvas");
    cv.width = mw;
    cv.height = mh;
    const c = cv.getContext("2d", { willReadFrequently: true });
    c.scale(sc, sc);
    drawMark(c, L.big);
    const px = c.getImageData(0, 0, mw, mh).data;
    const at = (x, y) => {
      const ix = Math.round(x * sc),
        iy = Math.round(y * sc);
      if (ix < 0 || iy < 0 || ix >= mw || iy >= mh) return -1;
      return (iy * mw + ix) * 4;
    };
    const hexPoints = (s) => {
      const pts = [];
      const dy = s * 0.866;
      let row = 0;
      for (let y = dy / 2; y < H; y += dy, row++)
        for (let x = (row % 2 ? s / 2 : 0) + s / 4; x < W; x += s) {
          const i = at(x, y);
          if (i >= 0 && px[i + 3] > 140) pts.push([x, y, px[i] - px[i + 1] > 60]);
        }
      return pts;
    };
    let lo = 2,
      hi = 120;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (hexPoints(mid).length >= L.N) lo = mid;
      else hi = mid;
    }
    const s = lo;
    let pts = hexPoints(s);
    const rng = mulberry32(1607);
    for (let i = pts.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    pts = pts.slice(0, L.N);
    while (pts.length < L.N) pts.push(pts[Math.floor(rng() * pts.length)]);
    L.half = { step: s, r: s * 0.42 };

    // Match grid dots to targets by rank along a tilted axis so the swarm
    // sweeps instead of tangling.
    const ang = L.portrait ? 1.35 : 0.22;
    const ax = Math.cos(ang),
      ay = Math.sin(ang);
    const grid = [];
    for (let k = 0; k < L.cols; k++)
      for (let m = 0; m < L.rows; m++)
        grid.push({ k, m, x: (k + 0.5) * L.sp, y: L.cy + (m - (L.rows - 1) / 2) * L.sp });
    const key = (x, y) => x * ax + y * ay;
    const gOrd = grid.map((_, i) => i).sort((a, b) => key(grid[a].x, grid[a].y) - key(grid[b].x, grid[b].y));
    const tOrd = pts.map((_, i) => i).sort((a, b) => key(pts[a][0], pts[a][1]) - key(pts[b][0], pts[b][1]));
    L.dots = grid;
    gOrd.forEach((gi, rank) => {
      const g = grid[gi];
      const p = pts[tOrd[rank]];
      g.tx = p[0];
      g.ty = p[1];
      g.tc = p[2] ? RGB.red : RGB.ink;
      g.rank = rank / L.N;
      g.curve = (rng() * 2 - 1) * 160 * L.u;
      g.jit = rng();
    });
  }

  // ------------------------------------------------------------- helpers

  function capsule(ctx, x, y, w, h) {
    const r = Math.min(w, h) / 2;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
    ctx.fill();
  }

  // Brand word: tracked glyphs, red full stop, red tittle over every i
  // (red "i" underneath, dotless "ı" on top — the site's own trick).
  function glyph(ctx, ch, x, y, color) {
    if (ch === ".") {
      ctx.fillStyle = C.red;
      ctx.fillText(".", x, y);
    } else if (ch === "i") {
      ctx.fillStyle = C.red;
      ctx.fillText("i", x, y);
      ctx.fillStyle = color;
      ctx.fillText("ı", x, y);
    } else {
      ctx.fillStyle = color;
      ctx.fillText(ch, x, y);
    }
  }

  const bez = (p, t) => {
    const m = 1 - t;
    return [
      m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0],
      m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1],
    ];
  };
  // The site's red double underline, drawn on like its stroke-dashoffset.
  function underline(ctx, x, y, w, h, p, lw) {
    if (p <= 0) return;
    const map = ([px, py]) => [x + (px / 420) * w, y + (py / 40) * h];
    const segs = UNDERLINE.map((c) => {
      const pts = [];
      for (let i = 0; i <= 48; i++) pts.push(map(bez(c, i / 48)));
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      return { pts, len };
    });
    const total = segs.reduce((a, s) => a + s.len, 0);
    let left = p * total;
    ctx.strokeStyle = C.red;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of segs) {
      if (left <= 0) break;
      ctx.beginPath();
      ctx.moveTo(s.pts[0][0], s.pts[0][1]);
      let run = 0;
      for (let i = 1; i < s.pts.length; i++) {
        const [ax, ay] = s.pts[i - 1],
          [bx, by] = s.pts[i];
        const d = Math.hypot(bx - ax, by - ay);
        if (run + d >= left) {
          const f = (left - run) / d;
          ctx.lineTo(lerp(ax, bx, f), lerp(ay, by, f));
          break;
        }
        ctx.lineTo(bx, by);
        run += d;
      }
      ctx.stroke();
      left -= s.len;
    }
  }

  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*+=";
  // Typewriter reveal with a scramble on the leading edge.
  function typed(text, p, seed, frame) {
    const n = text.length;
    const shown = Math.floor(p * (n + 3));
    let out = "";
    for (let i = 0; i < Math.min(n, shown); i++) {
      const ch = text[i];
      if (i >= shown - 3 && p < 1 && ch !== " ")
        out += GLYPHS[Math.floor(hash(seed + i, Math.floor(frame / 2)) * GLYPHS.length)];
      else out += ch;
    }
    return out;
  }

  // -------------------------------------------------------------- scenes

  function sceneImpulse(ctx, t) {
    const { cx, cy, u, W, R0 } = L;
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, L.W, L.H);

    for (let i = 0; i < 2; i++) {
      const p = prog(t, 0.06 + i * 0.07, 0.62 + i * 0.07);
      if (p <= 0 || p >= 1) continue;
      ctx.strokeStyle = C.red;
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.lineWidth = lerp(4, 1, p) * u;
      ctx.beginPath();
      ctx.arc(cx, cy, R0 + E.outExpo(p) * 560 * u, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const r = R0 * spring(t - 0.02, 3.1, 8);
    let w = 2 * r,
      h = 2 * r;
    const sq = E.outCubic(prog(t, 0.28, 0.4));
    w *= 1 + 0.28 * sq;
    h *= 1 - 0.24 * sq;
    const st = E.inOutExpo(prog(t, 0.4, 0.58));
    w = lerp(w, W * 1.25, st);
    h = lerp(h, L.lineH, st);
    ctx.fillStyle = C.red;
    if (r > 0.1) capsule(ctx, cx, cy, w, h);
  }

  function bandHalf(t) {
    const open = E.outExpo(prog(t, 0.58, 0.9)) * L.bandH;
    const close = E.inExpo(prog(t, BAND_CLOSE, BAND_CLOSE + 0.15));
    return open * (1 - close);
  }

  // Camera punch on every word hit.
  function punch(t) {
    let s = 0,
      r = 0;
    WORDS.forEach((w, i) => {
      if (i === 0) return;
      const dt = t - w.t;
      if (dt < 0) return;
      s += 0.03 * Math.exp(-dt * 16);
      r += (i % 2 ? 1 : -1) * 0.006 * wobble(dt, 3, 12);
    });
    const dt = t - 0.6;
    if (dt > 0) s += 0.02 * wobble(dt, 4, 10);
    return { s, r };
  }

  function sceneType(ctx, t) {
    const { W, H, cx, cy, u } = L;
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);

    const bh = bandHalf(t);
    const pc = punch(t);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pc.r);
    ctx.scale(1 + pc.s, 1 + pc.s);
    ctx.translate(-cx, -cy);

    // Ink band.
    ctx.fillStyle = C.ink;
    ctx.fillRect(-W, cy - bh, W * 3, bh * 2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(-W, cy - bh, W * 3, bh * 2);
    ctx.clip();

    const roll = L.wordCap * 1.35;
    ctx.font = L.wordFont;
    L.words.forEach((wd, i) => {
      const next = L.words[i + 1];
      const first = i === 0;
      // Swaps roll inside a slot; the intro rises from the band edge.
      ctx.save();
      if (!first || t > next.t) {
        ctx.beginPath();
        ctx.rect(-W, L.wordBase - L.wordCap * 1.18, W * 3, L.wordCap * 1.46);
        ctx.clip();
      }
      wd.chars.forEach((ch, j) => {
        const d0 = first ? j * 0.026 : 0.035 + j * 0.01;
        const pin = E.outExpo(prog(t, wd.t + d0, wd.t + d0 + (first ? 0.36 : 0.18)));
        const pout = next ? E.inQuart(prog(t, next.t + j * 0.008, next.t + j * 0.008 + 0.07)) : 0;
        if (pin <= 0 || pout >= 1) return;
        const dy = (1 - pin) * (first ? L.bandH * 1.1 : roll) - pout * roll;
        const skew = -(1 - pin) * 0.35 + pout * 0.25;
        ctx.save();
        ctx.translate(wd.xs[j], L.wordBase + dy);
        ctx.transform(1, 0, skew, 1, 0, 0);
        glyph(ctx, ch, 0, 0, C.paper);
        ctx.restore();
      });
      ctx.restore();
    });

    // "Properly." gets the hand-drawn underline, as on the site.
    const last = L.words[L.words.length - 1];
    underline(
      ctx,
      last.x0 - last.width * 0.03,
      L.wordBase + L.wordFs * 0.02,
      last.width * 1.06,
      L.wordFs * 0.36,
      E.outCubic(prog(t, last.t + 0.08, last.t + 0.3)),
      5 * u,
    );

    // Band furniture.
    const fa = prog(t, 0.72, 0.9);
    if (fa > 0) {
      let idx = 0;
      WORDS.forEach((w, i) => {
        if (t >= w.t) idx = i;
      });
      ctx.globalAlpha = fa * 0.6;
      ctx.fillStyle = C.line;
      ctx.font = `500 ${17 * u}px ${F_MONO}`;
      ctx.textBaseline = "top";
      const pad = (L.portrait ? 40 : 56) * u;
      ctx.fillText(`0${idx + 1} / 05`, pad, cy - bh + 24 * u);
      ctx.textAlign = "right";
      ctx.fillText("GOODSHIGOTO", W - pad, cy - bh + 24 * u);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const ticks = L.portrait ? 24 : 48;
      for (let i = 0; i <= ticks; i++) {
        const x = pad + ((W - pad * 2) * i) / ticks;
        const h = (i % 4 === 0 ? 12 : 5) * u;
        ctx.fillRect(x - u, cy + bh - 20 * u - h, 2 * u, h);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Red edge lines (the split line).
    ctx.fillStyle = C.red;
    const lh = L.lineH;
    if (bh < lh / 2) ctx.fillRect(-W, cy - lh / 2, W * 3, lh);
    else {
      ctx.fillRect(-W, cy - bh - lh / 2, W * 3, lh);
      ctx.fillRect(-W, cy + bh - lh / 2, W * 3, lh);
    }
    ctx.restore();
  }

  function fanProgress(g, t) {
    const c = (L.cols - 1) / 2;
    const delay = (Math.abs(g.k - c) / c) * 0.1;
    return E.outExpo(prog(t, 2.02 + delay, 2.4 + delay));
  }

  function sceneSystems(ctx, t) {
    const { W, H, cx, cy, u, cols, rows, sp, rDot } = L;
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);

    // 1.95–2.10: the single line fractures into rounded segments → dots.
    if (t < 2.12) {
      ctx.fillStyle = C.red;
      const c = (cols - 1) / 2;
      for (let k = 0; k < cols; k++) {
        const d = (Math.abs(k - c) / c) * 0.06;
        const e = E.inOutCubic(prog(t, 1.95 + d, 2.06 + d));
        capsule(ctx, (k + 0.5) * sp, cy, lerp(sp + 1, rDot * 2, e), lerp(L.lineH, rDot * 2, e));
      }
      if (t < 1.97) {
        ctx.fillRect(-W, cy - L.lineH / 2, W, L.lineH);
        ctx.fillRect(W, cy - L.lineH / 2, W, L.lineH);
      }
      return;
    }

    const env = prog(t, 2.12, 2.3) * (1 - prog(t, 2.5, 2.7));
    const rip = t - 2.12;
    const conv0 = 2.55;
    const solid = E.inOutCubic(prog(t, 3.0, 3.16));
    const hr = L.half.r;
    for (const g of L.dots) {
      const pf = fanProgress(g, Math.min(t, 2.54));
      const gx = g.x,
        gy = cy + (g.m - (rows - 1) / 2) * sp * pf;
      const dist = Math.hypot(g.x - cx, g.y - cy) / u;
      const wave = Math.max(0, Math.sin(dist / 80 - rip * 26)) ** 6 * env;
      const delay = g.rank * 0.16 + g.jit * 0.03;
      const e = E.inOutExpo(prog(t, conv0 + delay, conv0 + delay + 0.4));
      let x = lerp(gx, g.tx, e);
      let y = lerp(gy, g.ty, e);
      const vx = g.tx - gx,
        vy = g.ty - gy;
      const vl = Math.hypot(vx, vy) || 1;
      const arc = Math.sin(Math.PI * e) * g.curve;
      x += (-vy / vl) * arc;
      y += (vx / vl) * arc;
      let r = rDot * (1 + 0.9 * wave);
      r = lerp(r, hr, e);
      r *= 1 - 0.35 * Math.sin(Math.PI * e);
      r = lerp(r, L.half.step * 0.7, solid);
      // red line → ink grid, red on the ripple crest, then the mark's colour
      let col = mixArr(RGB.red, RGB.ink, E.outCubic(prog(pf, 0.05, 0.35)));
      col = mixArr(col, RGB.red, wave);
      col = mixArr(col, g.tc, e);
      ctx.globalAlpha = 1 - solid;
      ctx.fillStyle = rgb(col);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (solid > 0) drawMark(ctx, L.big, solid);
  }

  function sceneZoom(ctx, t) {
    const { W, H, cx, cy } = L;
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
    const p = prog(t, 3.18, 3.52);
    const S = Math.pow(80, E.inQuart(p));
    const pe = E.inOutCubic(prog(t, 3.16, 3.44));
    const px = lerp(cx, L.focal.x, pe),
      py = lerp(cy, L.focal.y, pe);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(E.inCubic(p) * 0.3);
    ctx.scale(S, S);
    ctx.translate(-px, -py);
    drawMark(ctx, L.big);
    ctx.restore();
  }

  function wipePath(ctx, t0, t1, t) {
    const { W, H } = L;
    const k = H * 0.28;
    const e = E.inOutExpo(prog(t, t0, t1));
    const xe = lerp(-k * 2, W + k * 2, e);
    ctx.beginPath();
    ctx.moveTo(-k * 2, 0);
    ctx.lineTo(xe + k, 0);
    ctx.lineTo(xe - k, H);
    ctx.lineTo(-k * 2, H);
    ctx.closePath();
    return e;
  }

  function sceneLockup(ctx, t, frame) {
    const { W, H, cx, cy, u } = L;
    const lk = L.lk;
    ctx.fillStyle = C.red;
    ctx.fillRect(0, 0, W, H);
    if (wipePath(ctx, 3.52, 3.84, t) > 0) {
      ctx.fillStyle = C.ink;
      ctx.fill();
    }
    if (wipePath(ctx, 3.58, 3.92, t) <= 0) return;
    ctx.fillStyle = C.paper;
    ctx.fill();
    ctx.save();
    ctx.clip();

    // Settle push-out + a tap when the i-dot lands.
    const landT = 4.36;
    const s = 1 + 0.06 * (1 - E.outExpo(prog(t, 3.56, 4.6))) + 0.005 * wobble(t - landT, 4, 9);
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);

    // --- Mark: the ensō paints itself, the mountain sweeps in, the sun rises.
    const mr = lk.mark;
    const en = MARK.enso0;
    const [ex, ey] = mp(mr, en.x, en.y);
    const pe = E.inOutCubic(prog(t, 3.64, 4.1));
    if (pe > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.arc(ex, ey, mr.h * 2, en.a0 - 0.05, lerp(en.a0 - 0.05, en.a1 + 0.05, pe));
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(MARK.enso, mr.x, mr.y, mr.w, mr.h);
      ctx.restore();
    }
    const pc = E.inOutCubic(prog(t, 3.84, 4.16));
    if (pc > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(mr.x, mr.y, mr.w * pc, mr.h);
      ctx.clip();
      ctx.drawImage(MARK.chev, mr.x, mr.y + (1 - pc) * mr.h * 0.06, mr.w, mr.h);
      ctx.restore();
    }
    const sunT = 4.08;
    const ss = spring(t - sunT, 2.6, 7);
    if (ss > 0) {
      const [sx, sy] = mp(mr, MARK.sunX, MARK.sunY);
      const pr = prog(t, sunT, sunT + 0.5);
      if (pr > 0 && pr < 1) {
        ctx.strokeStyle = C.red;
        ctx.globalAlpha = 1 - pr;
        ctx.lineWidth = 2.5 * u;
        ctx.beginPath();
        ctx.arc(sx, sy, MARK.sunR * mr.s * (1 + E.outExpo(pr) * 2.2), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(ss, ss);
      ctx.translate(-sx, -sy);
      drawSun(ctx, mr);
      ctx.restore();
    }

    // --- Wordmark: letters rise out of a baseline mask.
    ctx.font = lk.font;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, lk.base - lk.fs * 1.2, W, lk.fs * 1.2 + lk.fs * 0.26);
    ctx.clip();
    lk.word.chars.forEach((ch, j) => {
      const t0 = 3.74 + j * 0.022;
      const e = E.outExpo(prog(t, t0, t0 + 0.55));
      if (e <= 0) return;
      ctx.save();
      ctx.translate(lk.wxs[j], lk.base + (1 - e) * lk.fs * 1.3);
      ctx.rotate((1 - e) * 0.16);
      ctx.fillStyle = C.ink;
      ctx.fillText(j === lk.iIdx ? "ı" : ch, 0, 0);
      ctx.restore();
    });
    ctx.restore();

    // The opening dot, one last time: it drops onto the i.
    const d = lk.dot;
    const fallT0 = 4.16;
    if (t >= fallT0) {
      const pf = prog(t, fallT0, landT);
      let y = lerp(-d.r * 4, d.y, E.inQuad(pf));
      let sx = 1 - 0.3 * E.inQuad(pf),
        sy = 1 + 0.6 * E.inQuad(pf);
      if (t >= landT) {
        const q = 0.45 * wobble(t - landT, 3.6, 10);
        sx = 1 + q;
        sy = 1 - q;
        y = d.y - Math.max(0, Math.sin(Math.PI * prog(t, landT + 0.03, landT + 0.2))) * d.r * 0.9;
      }
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.ellipse(d.x, y + d.r - d.r * sy, d.r * sx, d.r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Tagline, word by word, then the underline.
    ctx.font = lk.tagFont;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, lk.tagBase - lk.tagFs * 1.1, W, lk.tagFs * 1.4);
    ctx.clip();
    lk.tag.forEach((wd, i) => {
      const t0 = 4.12 + i * 0.05;
      const e = E.outExpo(prog(t, t0, t0 + 0.5));
      if (e <= 0) return;
      wd.chars.forEach((ch, j) => glyph(ctx, ch, wd.xs[j], lk.tagBase + (1 - e) * lk.tagFs * 1.3, C.ink));
    });
    ctx.restore();
    underline(
      ctx,
      lk.under.x - lk.under.w * 0.03,
      lk.under.y + lk.tagFs * 0.02,
      lk.under.w * 1.06,
      lk.tagFs * 0.36,
      E.outCubic(prog(t, 4.42, 4.82)),
      Math.max(2.3, lk.tagFs * 0.034),
    );

    // --- Meta line.
    const pm = prog(t, 4.3, 4.7);
    const rl = E.outExpo(prog(t, 4.2, 4.8));
    ctx.fillStyle = C.line;
    ctx.fillRect(lk.mx, lk.metaY - 26 * u, (W - lk.mx * 2) * rl, Math.max(1, 1.5 * u));
    ctx.font = `500 ${lk.metaFs}px ${F_MONO}`;
    ctx.fillStyle = C.soft;
    ctx.textBaseline = "top";
    ctx.fillText(typed("WEBSITES · SOFTWARE · AUTOMATIONS", pm, 11, frame), lk.mx, lk.metaY);
    ctx.textAlign = "right";
    ctx.fillText(typed("GOODSHIGOTO.COM", pm, 47, frame), W - lk.mx, lk.metaY);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.restore();
  }

  function hud(ctx, t, frame) {
    const { W, H, u } = L;
    const a = 1 - prog(t, 3.4, 3.52);
    if (a <= 0) return;
    const m = (L.portrait ? 36 : 44) * u;
    const len = 30 * u * E.outExpo(prog(t, 0.04, 0.5));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.ink;
    const lw = 2 * u;
    for (const [x, y, sx, sy] of [
      [m, m, 1, 1],
      [W - m, m, -1, 1],
      [m, H - m, 1, -1],
      [W - m, H - m, -1, -1],
    ]) {
      ctx.fillRect(x, y - (sy < 0 ? lw : 0), len * sx, lw);
      ctx.fillRect(x - (sx < 0 ? lw : 0), y, lw, len * sy);
    }

    ctx.font = `500 ${16 * u}px ${F_MONO}`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.muted;
    const pt = prog(t, 0.08, 0.45);
    const ix = m + 44 * u,
      iy = m + 8 * u;
    ctx.fillText(typed("GOODSHIGOTO / REEL 01", pt, 3, frame), ix, iy);

    const sec = Math.floor(t);
    const ff = Math.floor((t - sec) * FPS);
    const tc = `00:00:${String(sec).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
    ctx.textAlign = "right";
    if (pt > 0) {
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(W - ix - ctx.measureText(tc).width - 16 * u, iy, 5 * u, 0, Math.PI * 2);
      if (frame % 30 < 20) ctx.fill();
      ctx.fillStyle = C.muted;
      ctx.fillText(tc, W - ix, iy);
    }

    let si = 0;
    SCENES.forEach(([st], i) => {
      if (t >= st) si = i;
    });
    const [st, label] = SCENES[si];
    const by = H - m - 8 * u;
    ctx.textAlign = "left";
    ctx.fillText(typed(label, si === 0 ? pt : prog(t, st, st + 0.16), 29 + si * 7, frame), ix, by);

    const bw = 180 * u;
    ctx.fillStyle = C.ink;
    ctx.globalAlpha = a * 0.15;
    ctx.fillRect(W - ix - bw, by - u, bw, 2 * u);
    ctx.globalAlpha = a;
    ctx.fillStyle = C.red;
    ctx.fillRect(W - ix - bw, by - u, bw * clamp(t / DUR) * E.outExpo(prog(t, 0.1, 0.5)), 2 * u);
    ctx.restore();
  }

  // ----------------------------------------------------------------- draw

  function drawScene(ctx, t) {
    t = clamp(t, 0, DUR);
    const frame = Math.floor(t * FPS + 1e-6);
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    if (t < 0.58) sceneImpulse(ctx, t);
    else if (t < 1.95) sceneType(ctx, t);
    else if (t < 3.18) sceneSystems(ctx, t);
    else if (t < 3.52) sceneZoom(ctx, t);
    else sceneLockup(ctx, t, frame);
    hud(ctx, t, frame);
    ctx.restore();
  }

  let acc = null;
  // Motion blur: average `samples` sub-frames across a 180° shutter.
  function draw(ctx, t, samples = 1) {
    if (samples <= 1) return drawScene(ctx, t);
    const { W, H } = L;
    if (!acc || acc.width !== W || acc.height !== H) {
      acc = document.createElement("canvas");
      acc.width = W;
      acc.height = H;
    }
    const a = acc.getContext("2d");
    const shutter = 0.5 / FPS;
    for (let s = 0; s < samples; s++) {
      const ts = t + (s / (samples - 1) - 0.5) * shutter;
      a.setTransform(1, 0, 0, 1, 0, 0);
      drawScene(a, ts);
      ctx.globalAlpha = 1 / (s + 1);
      ctx.drawImage(acc, 0, 0);
    }
    ctx.globalAlpha = 1;
  }

  async function ready(markSrc = "assets/mark.png") {
    const img = new Image();
    img.src = markSrc;
    await Promise.all([
      img.decode(),
      document.fonts.load(`800 100px ${F_SANS}`),
      document.fonts.load(`500 100px ${F_MONO}`),
    ]);
    processMark(img);
  }

  window.REEL = { DUR, FPS, setup, draw, ready };
})();
