"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const SIGNAL = "var(--color-signal)";

/* Domain-aware idle shapes, one per project zone. All ~26px, signal red. */

function Candles() {
  return (
    <svg width="34" height="34" viewBox="0 0 28 28" fill="none" aria-hidden>
      <line x1="14" y1="2" x2="14" y2="26" stroke={SIGNAL} strokeWidth="1.5" />
      <rect x="10.5" y="9" width="7" height="10" fill={SIGNAL} />
    </svg>
  );
}

function KnightMark() {
  return (
    <span className="block text-[31px] leading-none text-signal select-none">♞</span>
  );
}

function MapPin() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2 C7.6 2 4.5 5.2 4.5 9.3 C4.5 14.2 12 22 12 22 C12 22 19.5 14.2 19.5 9.3 C19.5 5.2 16.4 2 12 2 Z"
        stroke={SIGNAL}
        strokeWidth="1.8"
      />
      <circle cx="12" cy="9.3" r="2.6" fill={SIGNAL} />
    </svg>
  );
}

function ScanLine() {
  return (
    <svg width="36" height="31" viewBox="0 0 30 26" fill="none" aria-hidden className="animate-pulse">
      <line x1="2" y1="13" x2="28" y2="13" stroke={SIGNAL} strokeWidth="2.5" />
      <path d="M 2 7 L 2 19" stroke={SIGNAL} strokeWidth="1.5" />
      <path d="M 28 7 L 28 19" stroke={SIGNAL} strokeWidth="1.5" />
    </svg>
  );
}

function Dustbin() {
  return (
    <svg width="31" height="31" viewBox="0 0 24 24" fill="none" aria-hidden>
      <line x1="4" y1="6.5" x2="20" y2="6.5" stroke={SIGNAL} strokeWidth="1.8" />
      <path d="M 9.5 6.5 L 9.5 4 L 14.5 4 L 14.5 6.5" fill="none" stroke={SIGNAL} strokeWidth="1.8" />
      <path d="M 6 6.5 L 7.5 21 L 16.5 21 L 18 6.5" fill="none" stroke={SIGNAL} strokeWidth="1.8" />
      <line x1="10" y1="10" x2="10.4" y2="17.5" stroke={SIGNAL} strokeWidth="1.5" />
      <line x1="14" y1="10" x2="13.6" y2="17.5" stroke={SIGNAL} strokeWidth="1.5" />
    </svg>
  );
}

function DefaultCrosshair() {
  return (
    <div className="relative h-[34px] w-[34px]">
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-signal" />
      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-signal" />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-signal" />
    </div>
  );
}

const ZONE_SHAPES: Record<string, () => React.ReactElement> = {
  flaggo: MapPin,
  "chess-coach": KnightMark,
  multibagger: Candles,
  extracta: ScanLine,
  "whatsapp-cleaner": Dustbin,
  clenow: Candles,
};

export function Cursor() {
  const reduced = useReducedMotion();
  const [label, setLabel] = useState<string | null>(null);
  const [zone, setZone] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 650, damping: 45 });
  const sy = useSpring(y, { stiffness: 650, damping: 45 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("cursor-takeover");
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      // over a live insert the embedded app owns the cursor
      setVisible(!(e.target as Element).closest?.("[data-cursor-native]"));
    };
    const over = (e: MouseEvent) => {
      const el = e.target as Element;
      const target = el.closest("a, button, [data-cursor]");
      setLabel(target ? (target.getAttribute("data-cursor") ?? "OPEN") : null);
      setZone(el.closest("[data-cursor-zone]")?.getAttribute("data-cursor-zone") ?? null);
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.classList.remove("cursor-takeover");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  if (reduced) return null;

  return (
    <motion.div
      className="custom-cursor pointer-events-none fixed left-0 top-0 z-[300] hidden md:block"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <AnimatePresence mode="wait" initial={false}>
          {label ? (
            <motion.div
              key="label"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="bg-signal text-paper mono text-[9px] px-3 py-2 whitespace-nowrap"
            >
              {label}
            </motion.div>
          ) : (
            (() => {
              const Shape = (zone && ZONE_SHAPES[zone]) || DefaultCrosshair;
              return (
                <motion.div
                  key={zone && ZONE_SHAPES[zone] ? zone : "crosshair"}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Shape />
                </motion.div>
              );
            })()
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
