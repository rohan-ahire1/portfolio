"use client";

import { now } from "@/lib/content";

export function Now() {
  return (
    <section id="now" className="border-b-2 border-ink bg-paper-2 overflow-hidden">
      <div className="flex items-stretch">
        <span className="bg-signal text-paper display text-sm px-4 py-3 shrink-0 flex items-center">
          NOW
        </span>
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="marquee-track flex animate-marquee whitespace-nowrap">
            {[...now, ...now].map((item, i) => (
              <span key={i} className="mono text-[11px] text-muted inline-flex items-center">
                <span className="mx-4">{item}</span>
                <span className="text-signal">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
