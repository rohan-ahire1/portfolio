/*
 * GOOD SHIGOTO — landing reel.
 *
 * One deterministic function of time: draw(t) paints the frame at t seconds.
 * The same code plays live in the browser (index.html) and renders the
 * master video frame-by-frame (render.mjs), with optional motion blur.
 *
 * Beats (seconds):
 *   0.00  IMPULSE     red dot springs in, squashes, shoots into a line
 *   0.58  KINETIC     line splits into a band; word roll MOTION → WORK
 *   1.80  SYSTEMS     band slams shut, line breaks into a dot grid, ripple
 *   2.55  FORM        dots fly into halftone 仕事, resolve to solid
 *   3.18  TRANSITION  twisting zoom through a stroke into pure red
 *   3.52  LOCKUP      layered wipes, GOOD SHIGOTO, the dot lands as the full stop
 *   4.60  hold        clean end frame
 */
(function () {
  "use strict";

  const C = {
    ink: "#0c0c0c",
    paper: "#f2ede4",
    red: "#e10600",
    muted: "#8c857a",
  };
  const RGB = { red: [225, 6, 0], paper: [242, 237, 228] };
  const DUR = 5.0;
  const FPS = 60;

  const F_DISPLAY = '"Archivo Black"';
  const F_MONO = '"Space Mono"';
  const F_JP = '"Dela Gothic One"';

  const WORDS = [
    { w: "MOTION", jp: "モーション", t: 0.62, col: C.ink },
    { w: "TYPE", jp: "タイポ", t: 1.12, col: C.red },
    { w: "TIMING", jp: "タイミング", t: 1.26, col: C.ink },
    { w: "RHYTHM", jp: "リズム", t: 1.4, col: C.red },
    { w: "WORK", jp: "仕事", t: 1.54, col: C.ink },
  ];
  const BAND_CLOSE = 1.8;

  const SCENES = [
    [0.0, "01 — IMPULSE"],
    [0.58, "02 — KINETIC TYPE"],
    [1.95, "03 — SYSTEMS"],
    [2.55, "04 — FORM / 仕事"],
    [3.18, "05 — TRANSITION"],
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
  const mix = (a, b, t) =>
    `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

  // --------------------------------------------------------------- setup

  let L = null; // layout, rebuilt per canvas size
  const scratch = document.createElement("canvas").getContext("2d");
  const measure = (text, font) => {
    scratch.font = font;
    return scratch.measureText(text);
  };

  function setup(W, H) {
    const u = Math.min(W, H) / 1080;
    const portrait = H > W;
    L = { W, H, u, portrait, cx: W / 2, cy: H / 2 };

    // Scene A
    L.R0 = 62 * u;
    L.lineH = 8 * u;

    // Scene B — word band
    L.bandH = 270 * u;
    let widest = 0;
    for (const w of WORDS) widest = Math.max(widest, measure(w.w, `100px ${F_DISPLAY}`).width);
    L.wordFs = Math.min(360 * u, ((portrait ? 0.8 : 0.78) * W) / widest * 100);
    L.wordFont = `${L.wordFs}px ${F_DISPLAY}`;
    L.wordCap = measure("H", L.wordFont).actualBoundingBoxAscent;
    L.wordBase = L.cy + L.wordCap / 2;
    L.words = WORDS.map((w) => {
      const width = measure(w.w, L.wordFont).width;
      const x0 = L.cx - width / 2;
      const xs = [...w.w].map((_, j) => x0 + measure(w.w.slice(0, j), L.wordFont).width);
      return { ...w, width, xs };
    });
    L.jpFs = 40 * u;
    L.jpX = W - (portrait ? 56 : 84) * u;

    // Scene C — grid
    L.cols = portrait ? 18 : 32;
    L.rows = Math.round((L.cols * H) / W);
    L.N = L.cols * L.rows;
    L.sp = W / L.cols;
    L.rDot = L.sp * 0.2;

    // Scene C — kanji target
    buildKanji();

    // Scene E — lockup
    const x0 = W * (portrait ? 0.08 : 0.085);
    const wS = measure("SHIGOTO", `100px ${F_DISPLAY}`).width;
    const fs = Math.min(((portrait ? 0.84 : 0.6) * W) / wS * 100, H * (portrait ? 0.12 : 0.26));
    const font = `${fs}px ${F_DISPLAY}`;
    const cap = measure("H", font).actualBoundingBoxAscent;
    const lead = fs * 0.9;
    const blockH = cap + lead;
    const y1 = L.cy - blockH / 2 + cap + (portrait ? 0 : 10 * u);
    const y2 = y1 + lead;
    const line = (s, y) => ({
      s,
      y,
      xs: [...s].map((_, j) => x0 + measure(s.slice(0, j), font).width),
      width: measure(s, font).width,
    });
    L.lk = {
      x0,
      fs,
      font,
      cap,
      lines: [line("GOOD", y1), line("SHIGOTO", y2)],
      yTop: y1 - cap - fs * 0.32,
      yBot: y2 + fs * 0.26,
      metaFs: (portrait ? 22 : 20) * u,
    };
    const r = fs * 0.105;
    L.lk.dot = { r, x: x0 + L.lk.lines[1].width + fs * 0.05 + r, y: y2 - r };
    if (portrait) {
      const ks = W * 0.15;
      L.lk.kanji = { ks, x: W - x0 - ks / 2, ys: [H * 0.13 + ks * 0.5, H * 0.13 + ks * 1.5] };
    } else {
      const span = L.lk.yBot - L.lk.yTop;
      const ks = Math.min(span * 0.44, W - x0 - (x0 + L.lk.lines[1].width + fs * 0.4) - x0 * 0.2);
      L.lk.kanji = {
        ks,
        x: W - x0 - ks / 2,
        ys: [L.lk.yTop + span * 0.27, L.lk.yTop + span * 0.73],
      };
    }
    return L;
  }

  // Draw one CJK glyph centred on (x, y).
  function glyphCentered(ctx, ch, x, y, size) {
    ctx.font = `${size}px ${F_JP}`;
    const m = ctx.measureText(ch);
    const gx = x - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
    const gy = y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    ctx.fillText(ch, gx, gy);
  }

  function drawKanjiSolid(ctx) {
    for (const g of L.kanji.glyphs) glyphCentered(ctx, g.ch, g.x, g.y, L.kanji.ks);
  }

  // Sample 仕事 into exactly N hex-packed points and find the deepest point
  // inside a stroke (the zoom-through target).
  function buildKanji() {
    const { W, H, cx, cy, portrait } = L;
    const ks = portrait ? Math.min(W * 0.66, H * 0.36) : Math.min(W * 0.34, H * 0.64);
    const off = ks * 0.53;
    L.kanji = {
      ks,
      glyphs: portrait
        ? [
            { ch: "仕", x: cx, y: cy - off },
            { ch: "事", x: cx, y: cy + off },
          ]
        : [
            { ch: "仕", x: cx - off, y: cy },
            { ch: "事", x: cx + off, y: cy },
          ],
    };

    const sc = 0.5;
    const mw = Math.ceil(W * sc),
      mh = Math.ceil(H * sc);
    const cv = document.createElement("canvas");
    cv.width = mw;
    cv.height = mh;
    const c = cv.getContext("2d", { willReadFrequently: true });
    c.scale(sc, sc);
    c.fillStyle = "#fff";
    drawKanjiSolid(c);
    const px = c.getImageData(0, 0, mw, mh).data;
    const filled = (x, y) => {
      const ix = Math.round(x * sc),
        iy = Math.round(y * sc);
      if (ix < 0 || iy < 0 || ix >= mw || iy >= mh) return false;
      return px[(iy * mw + ix) * 4 + 3] > 140;
    };
    const hexPoints = (s) => {
      const pts = [];
      const dy = s * 0.866;
      let row = 0;
      for (let y = dy / 2; y < H; y += dy, row++)
        for (let x = (row % 2 ? s / 2 : 0) + s / 4; x < W; x += s) if (filled(x, y)) pts.push([x, y]);
      return pts;
    };
    // Largest spacing that still yields ≥ N points.
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
    L.kanji.step = s;
    L.kanji.r = s * 0.4;

    // Match grid dots to targets by rank along a tilted axis so the swarm
    // sweeps instead of tangling.
    const ang = portrait ? 1.35 : 0.22;
    const ax = Math.cos(ang),
      ay = Math.sin(ang);
    const grid = [];
    for (let k = 0; k < L.cols; k++)
      for (let m = 0; m < L.rows; m++) grid.push({ k, m, x: (k + 0.5) * L.sp, y: L.cy + (m - (L.rows - 1) / 2) * L.sp });
    const key = (x, y) => x * ax + y * ay;
    const gOrd = grid.map((g, i) => i).sort((a, b) => key(grid[a].x, grid[a].y) - key(grid[b].x, grid[b].y));
    const tOrd = pts.map((p, i) => i).sort((a, b) => key(pts[a][0], pts[a][1]) - key(pts[b][0], pts[b][1]));
    L.dots = grid;
    gOrd.forEach((gi, rank) => {
      const g = grid[gi];
      g.tx = pts[tOrd[rank]][0];
      g.ty = pts[tOrd[rank]][1];
      g.rank = rank / L.N;
      g.curve = (rng() * 2 - 1) * 160 * L.u;
      g.jit = rng();
    });

    // Chessboard distance transform on the mask → deepest stroke point.
    const dist = new Float32Array(mw * mh);
    for (let i = 0; i < mw * mh; i++) dist[i] = px[i * 4 + 3] > 140 ? 1e9 : 0;
    for (let y = 0; y < mh; y++)
      for (let x = 0; x < mw; x++) {
        const i = y * mw + x;
        if (!dist[i]) continue;
        let d = dist[i];
        if (x > 0) d = Math.min(d, dist[i - 1] + 1);
        if (y > 0) d = Math.min(d, dist[i - mw] + 1);
        if (x > 0 && y > 0) d = Math.min(d, dist[i - mw - 1] + 1);
        if (x < mw - 1 && y > 0) d = Math.min(d, dist[i - mw + 1] + 1);
        dist[i] = d;
      }
    let best = 0,
      bi = 0;
    for (let y = mh - 1; y >= 0; y--)
      for (let x = mw - 1; x >= 0; x--) {
        const i = y * mw + x;
        if (!dist[i]) continue;
        let d = dist[i];
        if (x < mw - 1) d = Math.min(d, dist[i + 1] + 1);
        if (y < mh - 1) d = Math.min(d, dist[i + mw] + 1);
        if (x < mw - 1 && y < mh - 1) d = Math.min(d, dist[i + mw + 1] + 1);
        if (x > 0 && y < mh - 1) d = Math.min(d, dist[i + mw - 1] + 1);
        dist[i] = d;
        if (d > best) {
          best = d;
          bi = i;
        }
      }
    L.focal = { x: (bi % mw) / sc, y: Math.floor(bi / mw) / sc };
  }

  // ------------------------------------------------------------- helpers

  function capsule(ctx, x, y, w, h) {
    const r = Math.min(w, h) / 2;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
    ctx.fill();
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
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, L.W, L.H);

    // Shock rings off the spring-in.
    for (let i = 0; i < 2; i++) {
      const p = prog(t, 0.06 + i * 0.07, 0.62 + i * 0.07);
      if (p <= 0 || p >= 1) continue;
      ctx.strokeStyle = C.red;
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.lineWidth = lerp(5, 1, p) * u;
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

  function sceneKinetic(ctx, t) {
    const { W, H, cx, cy, u } = L;
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, W, H);

    const bh = bandHalf(t);
    const pc = punch(t);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pc.r);
    ctx.scale(1 + pc.s, 1 + pc.s);
    ctx.translate(-cx, -cy);

    // Paper band.
    ctx.fillStyle = C.paper;
    ctx.fillRect(-W, cy - bh, W * 3, bh * 2);

    // Words, clipped to the band.
    ctx.save();
    ctx.beginPath();
    ctx.rect(-W, cy - bh, W * 3, bh * 2);
    ctx.clip();

    const roll = L.wordCap * 1.3;
    L.words.forEach((wd, i) => {
      const next = L.words[i + 1];
      const first = i === 0;
      ctx.fillStyle = wd.col;
      ctx.font = L.wordFont;
      // Swaps roll inside a slot the height of the caps; the intro rises
      // from the band edge.
      ctx.save();
      if (!first || t > next.t) {
        ctx.beginPath();
        ctx.rect(-W, L.wordBase - L.wordCap * 1.14, W * 3, L.wordCap * 1.28);
        ctx.clip();
      }
      [...wd.w].forEach((ch, j) => {
        const d0 = first ? j * 0.03 : 0.035 + j * 0.012;
        const pin = E.outExpo(prog(t, wd.t + d0, wd.t + d0 + (first ? 0.36 : 0.18)));
        const pout = next ? E.inQuart(prog(t, next.t + j * 0.01, next.t + j * 0.01 + 0.07)) : 0;
        if (pin <= 0 || pout >= 1) return;
        const dy = (1 - pin) * (first ? L.bandH * 1.1 : roll) - pout * roll;
        const skew = -(1 - pin) * 0.35 + pout * 0.25;
        ctx.save();
        ctx.translate(wd.xs[j], L.wordBase + dy);
        ctx.transform(1, 0, skew, 1, 0, 0);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      });
      ctx.restore();

      // Tategaki label.
      const chars = [...wd.jp];
      const step = L.jpFs * 1.08;
      const y0 = cy - (chars.length * step) / 2 + step / 2;
      ctx.fillStyle = C.red;
      chars.forEach((ch, j) => {
        const pin = E.outExpo(prog(t, wd.t + 0.03 + j * 0.02, wd.t + 0.25 + j * 0.02));
        const pout = next ? E.inQuart(prog(t, next.t, next.t + 0.08)) : 0;
        if (pin <= 0 || pout >= 1) return;
        ctx.save();
        ctx.globalAlpha = pin * (1 - pout);
        ctx.translate(L.jpX, y0 + j * step + (1 - pin) * 30 * u - pout * 30 * u);
        if (ch === "ー") ctx.rotate(Math.PI / 2);
        glyphCentered(ctx, ch, 0, 0, L.jpFs);
        ctx.restore();
      });
    });

    // Band furniture.
    const fa = prog(t, 0.72, 0.9);
    if (fa > 0) {
      let idx = 0;
      WORDS.forEach((w, i) => {
        if (t >= w.t) idx = i;
      });
      ctx.globalAlpha = fa;
      ctx.fillStyle = C.muted;
      ctx.font = `${18 * u}px ${F_MONO}`;
      ctx.textBaseline = "top";
      const pad = (L.portrait ? 40 : 56) * u;
      ctx.fillText(`N° 0${idx + 1} / 05`, pad, cy - bh + 26 * u);
      ctx.textAlign = "right";
      ctx.fillText("KINETIC TYPE", W - pad, cy - bh + 26 * u);
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      // Tick ruler along the bottom edge.
      ctx.fillStyle = C.ink;
      const ticks = L.portrait ? 24 : 48;
      for (let i = 0; i <= ticks; i++) {
        const x = pad + ((W - pad * 2) * i) / ticks;
        const h = (i % 4 === 0 ? 14 : 6) * u;
        ctx.fillRect(x - u, cy + bh - 22 * u - h, 2 * u, h);
      }
      ctx.globalAlpha = 1;
      ctx.textBaseline = "alphabetic";
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

  function gridPos(g, t) {
    const { cy, cols, rows, sp } = L;
    const c = (cols - 1) / 2;
    const delay = (Math.abs(g.k - c) / c) * 0.1;
    const pf = E.outExpo(prog(t, 2.02 + delay, 2.4 + delay));
    return { x: g.x, y: cy + (g.m - (rows - 1) / 2) * sp * pf };
  }

  function sceneSystems(ctx, t) {
    const { W, H, cx, cy, u, cols, sp, rDot } = L;
    ctx.fillStyle = C.ink;
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
      // extend the line past the edges until it breaks
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
    const kr = L.kanji.r;
    for (const g of L.dots) {
      const gp = gridPos(g, Math.min(t, 2.54));
      const dist = Math.hypot(g.x - cx, g.y - cy) / u;
      const wave = Math.max(0, Math.sin(dist / 80 - rip * 26)) ** 6 * env;
      const delay = g.rank * 0.16 + g.jit * 0.03;
      const e = E.inOutExpo(prog(t, conv0 + delay, conv0 + delay + 0.4));
      let x = lerp(gp.x, g.tx, e);
      let y = lerp(gp.y, g.ty, e);
      // arc sideways along the flight
      const vx = g.tx - gp.x,
        vy = g.ty - gp.y;
      const vl = Math.hypot(vx, vy) || 1;
      const arc = Math.sin(Math.PI * e) * g.curve;
      x += (-vy / vl) * arc;
      y += (vx / vl) * arc;
      let r = rDot * (1 + 0.9 * wave);
      r = lerp(r, kr, e);
      // mid-flight the dots stretch a little
      r *= 1 - 0.35 * Math.sin(Math.PI * e);
      r = lerp(r, L.kanji.step * 0.72, solid);
      ctx.globalAlpha = 1 - solid;
      ctx.fillStyle = wave > 0.02 ? mix(RGB.red, RGB.paper, wave) : C.red;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (solid > 0) {
      ctx.globalAlpha = solid;
      ctx.fillStyle = C.red;
      drawKanjiSolid(ctx);
      ctx.globalAlpha = 1;
    }
  }

  function sceneZoom(ctx, t) {
    const { W, H, cx, cy } = L;
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, W, H);
    const p = prog(t, 3.18, 3.52);
    const S = Math.pow(120, E.inQuart(p));
    const pe = E.inOutCubic(prog(t, 3.16, 3.46));
    const px = lerp(cx, L.focal.x, pe),
      py = lerp(cy, L.focal.y, pe);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(E.inCubic(p) * 0.35);
    ctx.scale(S, S);
    ctx.translate(-px, -py);
    ctx.fillStyle = C.red;
    drawKanjiSolid(ctx);
    ctx.restore();
  }

  function wipe(ctx, t0, t1, t, color) {
    const { W, H } = L;
    const k = H * 0.28;
    const e = E.inOutExpo(prog(t, t0, t1));
    if (e <= 0) return null;
    const xe = lerp(-k * 2, W + k * 2, e);
    ctx.beginPath();
    ctx.moveTo(-k * 2, 0);
    ctx.lineTo(xe + k, 0);
    ctx.lineTo(xe - k, H);
    ctx.lineTo(-k * 2, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    return e;
  }

  function sceneLockup(ctx, t, frame) {
    const { W, H, cx, cy, u } = L;
    const lk = L.lk;
    ctx.fillStyle = C.red;
    ctx.fillRect(0, 0, W, H);
    wipe(ctx, 3.52, 3.84, t, C.ink);
    if (!wipe(ctx, 3.58, 3.92, t, C.paper)) return;

    // Clip everything to the paper wipe.
    ctx.save();
    {
      const k = H * 0.28;
      const e = E.inOutExpo(prog(t, 3.58, 3.92));
      const xe = lerp(-k * 2, W + k * 2, e);
      ctx.beginPath();
      ctx.moveTo(-k * 2, 0);
      ctx.lineTo(xe + k, 0);
      ctx.lineTo(xe - k, H);
      ctx.lineTo(-k * 2, H);
      ctx.closePath();
      ctx.clip();
    }

    // Settle push-out + a tap when the dot lands.
    const landT = 4.3;
    const s = 1 + 0.07 * (1 - E.outExpo(prog(t, 3.56, 4.5))) + 0.006 * wobble(t - landT, 4, 9);
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);

    // Letters rise out of their line masks.
    ctx.fillStyle = C.ink;
    ctx.font = lk.font;
    lk.lines.forEach((ln, li) => {
      const t0 = 3.68 + li * 0.08;
      ctx.save();
      ctx.beginPath();
      ctx.rect(lk.x0 - lk.fs * 0.2, ln.y - lk.cap - lk.fs * 0.14, W, lk.cap + lk.fs * 0.14 + 3 * u);
      ctx.clip();
      [...ln.s].forEach((ch, j) => {
        const e = E.outExpo(prog(t, t0 + j * 0.03, t0 + j * 0.03 + 0.62));
        if (e <= 0) return;
        ctx.save();
        ctx.translate(ln.xs[j], ln.y + (1 - e) * lk.fs * 1.05);
        ctx.rotate((1 - e) * 0.18);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    });

    // Rules.
    const rw = W - lk.x0 * 2;
    const r1 = E.outExpo(prog(t, 3.8, 4.45));
    const r2 = E.outExpo(prog(t, 3.88, 4.52));
    ctx.fillStyle = C.ink;
    ctx.fillRect(lk.x0, lk.yTop, rw * r1, 3 * u);
    ctx.fillRect(lk.x0 + rw * (1 - r2), lk.yBot, rw * r2, 3 * u);

    // Meta type.
    ctx.font = `${lk.metaFs}px ${F_MONO}, ${F_JP}`;
    ctx.fillStyle = C.ink;
    const pTop = prog(t, 3.9, 4.3),
      pBot = prog(t, 4.0, 4.45);
    ctx.textBaseline = "bottom";
    ctx.fillText(typed("MOTION DESIGN — SHOWREEL ’26", pTop, 11, frame), lk.x0, lk.yTop - 14 * u);
    ctx.textAlign = "right";
    ctx.fillText(typed("GOODSHIGOTO.COM", pTop, 47, frame), W - lk.x0, lk.yTop - 14 * u);
    ctx.textBaseline = "top";
    ctx.fillStyle = C.muted;
    ctx.fillText(typed("© 2026", pBot, 83, frame), W - lk.x0, lk.yBot + 18 * u);
    ctx.textAlign = "left";
    ctx.fillText(typed("SHIGOTO (仕事) n. — WORK, DONE PROPERLY.", pBot, 97, frame), lk.x0, lk.yBot + 18 * u);
    ctx.textBaseline = "alphabetic";

    // Tategaki 仕事, wiped down stroke by stroke.
    const kj = lk.kanji;
    ["仕", "事"].forEach((ch, i) => {
      const e = E.outExpo(prog(t, 3.95 + i * 0.09, 4.4 + i * 0.09));
      if (e <= 0) return;
      const top = kj.ys[i] - kj.ks * 0.55;
      ctx.save();
      ctx.beginPath();
      ctx.rect(kj.x - kj.ks, top, kj.ks * 2, kj.ks * 1.1 * e);
      ctx.clip();
      ctx.fillStyle = C.red;
      glyphCentered(ctx, ch, kj.x, kj.ys[i] - (1 - e) * kj.ks * 0.25, kj.ks);
      ctx.restore();
    });

    // The dot from frame one lands as the full stop.
    const d = lk.dot;
    const fallT0 = 4.1;
    if (t >= fallT0) {
      const pf = prog(t, fallT0, landT);
      const y0 = -d.r * 3;
      let y = lerp(y0, d.y, E.inQuad(pf));
      let sx = 1 - 0.28 * E.inQuad(pf),
        sy = 1 + 0.55 * E.inQuad(pf);
      if (t >= landT) {
        const q = 0.42 * wobble(t - landT, 3.6, 10);
        sx = 1 + q;
        sy = 1 - q;
        // tiny rebound hop
        y = d.y - Math.max(0, Math.sin(Math.PI * prog(t, landT + 0.03, landT + 0.2))) * d.r * 0.5;
        // shock ring
        const pr = prog(t, landT, landT + 0.45);
        if (pr < 1) {
          ctx.strokeStyle = C.red;
          ctx.globalAlpha = 1 - pr;
          ctx.lineWidth = 3 * u;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y + d.r, d.r * (1 + E.outExpo(pr) * 3), d.r * (0.3 + E.outExpo(pr) * 0.8), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      ctx.fillStyle = C.red;
      ctx.beginPath();
      // anchor at the bottom so squash reads as contact
      ctx.ellipse(d.x, y + d.r - d.r * sy, d.r * sx, d.r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function hud(ctx, t, frame) {
    const { W, H, u } = L;
    const a = 1 - prog(t, 3.5, 3.6);
    if (a <= 0) return;
    const m = (L.portrait ? 36 : 44) * u;
    const len = 30 * u * E.outExpo(prog(t, 0.04, 0.5));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.paper;
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

    const fs = 17 * u;
    ctx.font = `${fs}px ${F_MONO}, ${F_JP}`;
    ctx.textBaseline = "middle";
    const pt = prog(t, 0.08, 0.45);
    const ix = m + 44 * u,
      iy = m + 8 * u;
    ctx.fillText(typed("GOOD SHIGOTO / REEL 01", pt, 3, frame), ix, iy);

    const sec = Math.floor(t);
    const ff = Math.floor((t - sec) * FPS);
    const tc = `00:00:${String(sec).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
    ctx.textAlign = "right";
    if (pt > 0) {
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(W - ix - ctx.measureText(tc).width - 16 * u, iy, 5 * u, 0, Math.PI * 2);
      if (frame % 30 < 20) ctx.fill();
      ctx.fillStyle = C.paper;
      ctx.fillText(tc, W - ix, iy);
    }

    // Scene label, scrambled on change.
    let si = 0;
    SCENES.forEach(([st], i) => {
      if (t >= st) si = i;
    });
    const [st, label] = SCENES[si];
    const by = H - m - 8 * u;
    ctx.textAlign = "left";
    ctx.fillText(typed(label, si === 0 ? pt : prog(t, st, st + 0.16), 29 + si * 7, frame), ix, by);

    // Progress bar.
    const bw = 180 * u;
    ctx.globalAlpha = a * 0.3;
    ctx.fillRect(W - ix - bw, by - u, bw, 2 * u);
    ctx.globalAlpha = a;
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
    else if (t < 1.95) sceneKinetic(ctx, t);
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

  async function ready() {
    await Promise.all([
      document.fonts.load(`100px ${F_DISPLAY}`),
      document.fonts.load(`100px ${F_MONO}`),
      document.fonts.load(`100px ${F_JP}`, "仕事モーション"),
    ]);
  }

  window.REEL = { DUR, FPS, setup, draw, ready };
})();
