"use client";

import { Magnetic } from "@/components/Magnetic";
import { marquee, site } from "@/lib/content";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Fragment } from "react";

const MarketStatus = dynamic(
  () => import("@/components/MarketStatus").then((m) => m.MarketStatus),
  { ssr: false },
);

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const nameWords = site.name.toUpperCase().split(" ");
  let charIndex = 0;

  return (
    <section
      id="top"
      className="relative min-h-[100svh] pt-20 flex flex-col justify-between overflow-hidden"
    >
      {/* Issue meta row */}
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex flex-wrap items-center justify-between gap-3 mono text-[10px] md:text-[11px] text-muted border-b border-ink pb-3"
        >
          <span>VOL. 01 — PERSONAL ISSUE</span>
          <span className="hidden md:block">
            <MarketStatus />
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-signal animate-pulse" />
            {site.location}
          </span>
          <span className="hidden sm:inline">{site.role}</span>
        </motion.div>
      </div>

      {/* Giant name */}
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-10 md:py-16 flex-1 flex flex-col justify-center">
        <div className="overflow-hidden">
          <h1
            className="display text-[clamp(3.5rem,16vw,12rem)] text-ink select-none"
            aria-label={site.name}
          >
            {nameWords.map((word, w) => (
              <Fragment key={`${word}-${w}`}>
                <span className="inline-block whitespace-nowrap">
                  {word.split("").map((ch, i) => (
                    <motion.span
                      key={`${ch}-${i}`}
                      className="inline-block"
                      initial={{ y: "110%", rotate: 6, opacity: 0 }}
                      animate={{ y: "0%", rotate: 0, opacity: 1 }}
                      transition={{
                        duration: 0.75,
                        delay: 0.35 + charIndex++ * 0.035,
                        ease,
                      }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
                {w < nameWords.length - 1 && " "}
              </Fragment>
            ))}
          </h1>
        </div>

        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease }}
            className="md:col-span-7 text-xl md:text-3xl leading-snug max-w-2xl font-body text-ink-soft"
          >
            {site.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease }}
            className="md:col-span-5 md:text-right space-y-4"
          >
            <p className="mono text-[11px] text-muted leading-relaxed">
              The six projects I&apos;d show first —
              <br />
              markets, games, AI, mobile.
            </p>
            <div className="flex md:justify-end gap-3">
              <Magnetic>
                <a
                  href="#work"
                  data-cursor="READ"
                  className="display text-sm md:text-base border-2 border-ink bg-ink text-paper px-5 py-3 hover:bg-signal hover:border-signal transition-colors duration-300 inline-block"
                >
                  READ THE WORK →
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="CODE ↗"
                  className="display text-sm md:text-base border-2 border-ink px-5 py-3 invert-hover inline-block"
                >
                  GITHUB
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dual marquee */}
      <div className="border-y-2 border-ink bg-ink text-paper overflow-hidden">
        <div className="marquee-track flex animate-marquee whitespace-nowrap py-3">
          {[...marquee, ...marquee].map((item, i) => (
            <span
              key={`a-${i}`}
              className="display text-2xl md:text-4xl mx-6 md:mx-10 inline-flex items-center gap-6"
            >
              {item}
              <span className="text-signal text-lg">■</span>
            </span>
          ))}
        </div>
      </div>
      <div className="border-b-2 border-ink bg-paper overflow-hidden">
        <div className="marquee-track flex animate-marquee-rev whitespace-nowrap py-2">
          {[...marquee].reverse().concat([...marquee].reverse()).map((item, i) => (
            <span
              key={`b-${i}`}
              className="mono text-[11px] md:text-xs mx-5 text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
