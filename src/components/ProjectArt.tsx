import type { ReactElement } from "react";

type ArtProps = { accent: string };

const INK = "var(--color-ink)";

function FlaggoArt({ accent }: ArtProps) {
  const dots: { cx: number; cy: number; r: number; delay: number }[] = [];
  const cx0 = 200;
  const cy0 = 210;
  const R = 150;
  for (let col = 0; col < 10; col++) {
    for (let row = 0; row < 12; row++) {
      const cx = 40 + col * (320 / 9);
      const cy = 40 + row * (340 / 11);
      const d = Math.hypot(cx - cx0, cy - cy0);
      dots.push({ cx, cy, r: d < R ? 2 + 5 * (1 - d / R) : 1, delay: (d / R) * 1.5 });
    }
  }
  return (
    <>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={accent}
          className="art-pulse"
          style={{ animationDelay: `${d.delay}s` }}
        />
      ))}
      <rect x={40} y={398} width={320} height={16} fill="none" stroke={INK} strokeWidth={1.5} />
      <rect x={40} y={422} width={320} height={16} fill={accent} opacity={0.15} stroke={accent} strokeWidth={1.5} />
      <rect x={40} y={446} width={320} height={16} fill="none" stroke={INK} strokeWidth={1.5} />
    </>
  );
}

function ChessArt({ accent }: ArtProps) {
  const squares: ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        squares.push(
          <rect key={`${r}-${c}`} x={40 + c * 40} y={40 + r * 40} width={40} height={40} fill={accent} opacity={0.12} />,
        );
      }
    }
  }
  const lines: ReactElement[] = [];
  for (let i = 0; i <= 8; i++) {
    lines.push(
      <line key={`h${i}`} x1={40} y1={40 + i * 40} x2={360} y2={40 + i * 40} stroke={INK} strokeWidth={1.5} />,
      <line key={`v${i}`} x1={40 + i * 40} y1={40} x2={40 + i * 40} y2={360} stroke={INK} strokeWidth={1.5} />,
    );
  }
  const mark = (x: number, y: number) => (
    <>
      <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} stroke={accent} strokeWidth={2.5} />
      <line x1={x - 12} y1={y + 12} x2={x + 12} y2={y - 12} stroke={accent} strokeWidth={2.5} />
    </>
  );
  return (
    <>
      {squares}
      {lines}
      {mark(100, 260)}
      {mark(220, 140)}
      <circle cx={300} cy={300} r={14} fill="none" stroke={accent} strokeWidth={2.5} className="art-pulse" />
      <polyline
        points="100,260 100,180 136,180"
        fill="none"
        stroke={accent}
        strokeWidth={2}
        pathLength={100}
        strokeDasharray={100}
        className="art-knight-path"
      />
      <polygon points="136,174 148,180 136,186" fill={accent} className="art-knight-arrow" />
      <line x1={40} y1={420} x2={200} y2={420} stroke={INK} strokeWidth={1.5} />
      <line x1={40} y1={444} x2={140} y2={444} stroke={INK} strokeWidth={1.5} />
    </>
  );
}

function MultibaggerArt({ accent }: ArtProps) {
  const candles: ReactElement[] = [];
  const filled = new Set([3, 6, 9, 11]);
  for (let i = 0; i < 12; i++) {
    const x = 45 + i * 27;
    const bodyTop = 415 - i * 20;
    const isAccent = filled.has(i);
    candles.push(
      <g key={i}>
        <line x1={x} y1={bodyTop - 16} x2={x} y2={bodyTop + 38} stroke={INK} strokeWidth={1.5} />
        <rect
          x={x - 7}
          y={bodyTop}
          width={14}
          height={26}
          fill={isAccent ? accent : "var(--color-paper)"}
          stroke={isAccent ? accent : INK}
          strokeWidth={1.5}
        />
      </g>,
    );
  }
  return (
    <>
      <line
        x1={40}
        y1={455}
        x2={355}
        y2={235}
        stroke={INK}
        strokeWidth={1.5}
        strokeDasharray="6 6"
        className="art-march"
      />
      <line x1={40} y1={190} x2={360} y2={190} stroke={INK} strokeWidth={1.5} />
      {candles}
      <rect x={337} y={185} width={10} height={10} fill={accent} className="animate-blink" />
    </>
  );
}

function ExtractaArt({ accent }: ArtProps) {
  const widths = [100, 80, 110, 70, 95, 105, 60, 88];
  const kvYs = [150, 220, 290, 360];
  return (
    <>
      <rect x={40} y={60} width={140} height={380} fill="none" stroke={INK} strokeWidth={2} />
      {widths.map((w, i) => (
        <line key={i} x1={55} y1={95 + i * 42} x2={55 + w} y2={95 + i * 42} stroke={INK} strokeWidth={1.5} />
      ))}
      <path
        d="M 232 100 Q 212 100 212 132 L 212 218 Q 212 250 196 250 Q 212 250 212 282 L 212 368 Q 212 400 232 400"
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      <path
        d="M 348 100 Q 368 100 368 132 L 368 218 Q 368 250 384 250 Q 368 250 368 282 L 368 368 Q 368 400 348 400"
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      {kvYs.map((y) => (
        <g key={y}>
          <line x1={244} y1={y} x2={274} y2={y} stroke={INK} strokeWidth={1.5} />
          <circle cx={282} cy={y} r={2} fill={INK} />
          <line x1={290} y1={y} x2={336} y2={y} stroke={accent} strokeWidth={2} />
        </g>
      ))}
      <line
        x1={30}
        y1={250}
        x2={370}
        y2={250}
        stroke={accent}
        strokeWidth={3}
        opacity={0.4}
        className="art-scan"
      />
    </>
  );
}

function CleanerArt({ accent }: ArtProps) {
  const cells: ReactElement[] = [];
  const struck = new Set(["0-1", "2-1", "1-3", "3-3", "2-4"]);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 4; c++) {
      if (c === 3 && r === 4) continue;
      const x = 40 + c * 82;
      const y = 50 + r * 84;
      cells.push(
        <g key={`${c}-${r}`}>
          <rect x={x} y={y} width={64} height={64} rx={4} fill="none" stroke={INK} strokeWidth={1.5} />
          {struck.has(`${c}-${r}`) && (
            <line
              x1={x + 6}
              y1={y + 6}
              x2={x + 58}
              y2={y + 58}
              stroke={accent}
              strokeWidth={2.5}
              pathLength={100}
              strokeDasharray={100}
              className="art-strike"
              style={{ animationDelay: `${(r * 4 + c) * 0.18}s` }}
            />
          )}
        </g>,
      );
    }
  }
  return (
    <>
      {cells}
      <line x1={294} y1={404} x2={342} y2={404} stroke={INK} strokeWidth={2} />
      <path d="M 312 404 L 312 398 L 324 398 L 324 404" fill="none" stroke={INK} strokeWidth={2} />
      <path d="M 300 410 L 304 444 L 332 444 L 336 410" fill="none" stroke={INK} strokeWidth={2} />
      <line x1={318} y1={416} x2={318} y2={438} stroke={accent} strokeWidth={2} />
    </>
  );
}

function ClenowArt({ accent }: ArtProps) {
  const dots: ReactElement[] = [];
  for (let i = 0; i < 20; i++) {
    const jx = ((i * 37) % 23) - 11;
    const jy = ((i * 53) % 31) - 15;
    dots.push(
      <circle
        key={i}
        cx={55 + i * 15.5 + jx * 0.8}
        cy={420 - i * 13 + jy}
        r={4}
        fill={INK}
        className="art-pulse"
        style={{ animationDelay: `${i * 0.12}s` }}
      />,
    );
  }
  const ticksBottom: ReactElement[] = [];
  for (let i = 0; i < 8; i++) {
    ticksBottom.push(
      <line key={`b${i}`} x1={60 + i * 40} y1={468} x2={60 + i * 40} y2={478} stroke={INK} strokeWidth={1.5} />,
    );
  }
  const ticksLeft: ReactElement[] = [];
  for (let i = 0; i < 6; i++) {
    ticksLeft.push(
      <line key={`l${i}`} x1={20} y1={80 + i * 64} x2={30} y2={80 + i * 64} stroke={INK} strokeWidth={1.5} />,
    );
  }
  return (
    <>
      <line
        x1={45}
        y1={389}
        x2={355}
        y2={129}
        stroke={INK}
        strokeWidth={1.5}
        strokeDasharray="5 7"
        className="art-march"
      />
      <line
        x1={45}
        y1={459}
        x2={355}
        y2={199}
        stroke={INK}
        strokeWidth={1.5}
        strokeDasharray="5 7"
        className="art-march"
      />
      {dots}
      <line x1={45} y1={424} x2={355} y2={164} stroke={accent} strokeWidth={2} />
      {ticksBottom}
      {ticksLeft}
    </>
  );
}

const art: Record<string, { caption: string; Svg: (p: ArtProps) => ReactElement }> = {
  flaggo: { caption: "WORLD FACTS, DRILLED", Svg: FlaggoArt },
  "chess-coach": { caption: "PATTERNS, NOT PUZZLES", Svg: ChessArt },
  multibagger: { caption: "SIGNAL OVER NOISE", Svg: MultibaggerArt },
  extracta: { caption: "PAPER IN, JSON OUT", Svg: ExtractaArt },
  "whatsapp-cleaner": { caption: "DUPLICATES, DELETED", Svg: CleanerArt },
  clenow: { caption: "SLOPE × R-SQUARED", Svg: ClenowArt },
};

export function ProjectArt({
  projectId,
  accent,
  number,
}: {
  projectId: string;
  accent: string;
  number: string;
}) {
  const entry = art[projectId];
  if (!entry) return null;
  const { caption, Svg } = entry;
  return (
    <div className="border-2 border-ink bg-paper-2 flex flex-col" data-cursor={`FIG. ${number}`}>
      <div className="aspect-[4/3] lg:aspect-[4/5] overflow-hidden">
        <svg
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          role="img"
          aria-label={caption}
        >
          <Svg accent={accent} />
        </svg>
      </div>
      <div className="border-t border-ink px-3 py-2 mono text-[10px] text-muted">
        FIG. {number} — {caption}
      </div>
    </div>
  );
}
