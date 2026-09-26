# GOOD SHIGOTO — landing reel

5-second motion piece for goodshigoto.com. One deterministic `draw(t)` in `reel.js`
drives both the live canvas (`index.html`) and the rendered masters.

| Beat | Time | What happens |
| --- | --- | --- |
| Impulse | 0.00 | Red dot springs in, squashes, shoots into a line |
| Kinetic type | 0.58 | Line splits into a band; slot-roll MOTION → TYPE → TIMING → RHYTHM → WORK with tategaki labels |
| Systems | 1.80 | Band slams shut, the line fractures into a 576-dot grid, ripple |
| Form | 2.55 | Dots fly into halftone 仕事, resolve to solid |
| Transition | 3.18 | Twisting zoom through a stroke into pure red |
| Lockup | 3.52 | Layered wipes, GOOD SHIGOTO, the opening dot lands as the full stop |

## Outputs (`public/showreel/`)

- `goodshigoto-reel.mp4` — 1920×1080, 60 fps, H.264, 8-sample motion blur
- `goodshigoto-reel.webm` — same, VP9
- `goodshigoto-reel-vertical.mp4` — 1080×1920 re-layout for phones
- `goodshigoto-reel-poster.jpg` — final frame

```html
<video autoplay muted playsinline preload="auto" poster="/showreel/goodshigoto-reel-poster.jpg">
  <source media="(orientation: portrait)" src="/showreel/goodshigoto-reel-vertical.mp4" type="video/mp4" />
  <source src="/showreel/goodshigoto-reel.webm" type="video/webm" />
  <source src="/showreel/goodshigoto-reel.mp4" type="video/mp4" />
</video>
```

No `loop`: it ends on a settled lockup, so the last frame doubles as a hero.

## Re-render

Needs Playwright and an ffmpeg with libx264/libvpx.

```bash
NODE_PATH=$(npm root -g) node render.cjs --out ../../public/showreel/goodshigoto-reel.mp4
NODE_PATH=$(npm root -g) node render.cjs --w 1080 --h 1920 --out vertical.mp4
NODE_PATH=$(npm root -g) node render.cjs --samples 1 --stills 1.2,2.9,4.9 --outdir stills
```

Open `index.html` over a local server to play it live at any aspect ratio (click to replay).
