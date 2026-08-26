"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

const MAX_PULL = 12;
const STRENGTH = 0.3;

let finePointer: boolean | null = null;
function hasFinePointer() {
  if (finePointer === null) {
    finePointer = !window.matchMedia("(pointer: coarse)").matches;
  }
  return finePointer;
}

export function Magnetic({ children, className = "inline-block" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  if (reduced) return <>{children}</>;

  const clamp = (v: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v));

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (!hasFinePointer() || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set(clamp((e.clientX - (r.left + r.width / 2)) * STRENGTH));
        y.set(clamp((e.clientY - (r.top + r.height / 2)) * STRENGTH));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
