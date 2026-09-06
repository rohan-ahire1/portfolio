"use client";

import { stats } from "@/lib/content";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

function StatCell({
  stat,
  index,
  className = "",
}: {
  stat: (typeof stats)[number];
  index: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  // Start at the final value so SSR, bots, and no-JS readers see real
  // numbers; restart from zero for the count-up once scrolled into view.
  const count = useMotionValue(stat.value);
  const rounded = useTransform(count, (v) =>
    stat.decimals ? v.toFixed(stat.decimals) : Math.round(v).toLocaleString("en-IN"),
  );

  useEffect(() => {
    if (!inView) return;
    count.set(0);
    const controls = animate(count, stat.value, {
      duration: 1.4,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, count, stat.value, index]);

  return (
    <div ref={ref} className={`bg-paper p-6 md:p-8 ${className}`}>
      <p className="display text-[clamp(2.5rem,6vw,4.5rem)] text-ink leading-none">
        <motion.span>{rounded}</motion.span>
        <span className="text-signal">{stat.suffix}</span>
      </p>
      <p className="mono text-[11px] text-ink mt-3">{stat.label}</p>
      <p className="mono text-[10px] text-muted mt-1">{stat.note}</p>
    </div>
  );
}

export function Numbers() {
  return (
    <section id="numbers" className="border-b-2 border-ink">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16">
        <p className="mono text-[11px] text-muted mb-6">
          SECTION 04 — BY THE NUMBERS
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px border-2 border-ink bg-ink">
          {stats.map((s, i) => (
            <StatCell
              key={s.label}
              stat={s}
              index={i}
              // avoid an ink-colored hole when the 2-col layout has an odd cell
              className={
                i === stats.length - 1 && stats.length % 2 === 1
                  ? "sm:col-span-2 lg:col-span-1"
                  : ""
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
