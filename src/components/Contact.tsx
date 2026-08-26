"use client";

import { Magnetic } from "@/components/Magnetic";
import { site } from "@/lib/content";
import { motion } from "framer-motion";

const colophon = [
  {
    label: "TYPE",
    lines: ["Archivo Black — display", "Newsreader — body", "Space Mono — labels"],
  },
  {
    label: "STACK",
    lines: ["Next.js 15 · Tailwind 4 · Framer Motion", "Deployed from a laptop in India"],
  },
  {
    label: "EDITION",
    lines: [
      "Vol. 01 — Personal Issue",
      `Set & shipped ${new Date().getFullYear()}`,
      "No trackers, no cookies",
    ],
  },
];

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden stripes">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-20 md:py-32">
        <p className="mono text-[11px] text-muted mb-4">SECTION 05 — CONTACT</p>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="display text-[clamp(3rem,12vw,9rem)] mb-8 max-w-5xl"
        >
          LET&apos;S BUILD
          <br />
          SOMETHING
          <span className="text-signal">.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-2xl text-ink-soft max-w-xl mb-12"
        >
          Have a product idea, a market system, or a messy workflow that needs
          software? Drop a line — I reply fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row flex-wrap gap-4"
        >
          <Magnetic className="block sm:inline-block">
            <a
              href={`mailto:${site.email}`}
              data-cursor="WRITE"
              className="display text-base sm:text-xl md:text-3xl border-4 border-ink bg-ink text-paper px-5 py-4 sm:px-8 sm:py-5 hover:bg-signal hover:border-signal transition-colors duration-300 inline-flex w-full sm:w-auto justify-center items-center gap-3 sm:gap-4 break-all"
            >
              {site.email}
              <span aria-hidden>→</span>
            </a>
          </Magnetic>
          <Magnetic className="block sm:inline-block">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              data-cursor="CODE ↗"
              className="display text-base sm:text-xl md:text-3xl border-4 border-ink px-5 py-4 sm:px-8 sm:py-5 invert-hover inline-flex w-full sm:w-auto justify-center items-center"
            >
              GITHUB ↗
            </a>
          </Magnetic>
        </motion.div>
      </div>

      {/* Media kit */}
      <div className="border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="mono text-[10px] text-signal mb-2">MEDIA KIT</p>
            <p className="text-base md:text-lg text-ink-soft max-w-md">
              The one-page version — who I am, what I&apos;ve shipped, where to
              reach me.
            </p>
          </div>
          <Magnetic>
            <a
              href="/resume.pdf"
              download
              data-cursor="SAVE ↓"
              className="display text-sm md:text-base border-2 border-ink px-5 py-3 invert-hover inline-block"
            >
              RESUME (PDF) ↓
            </a>
          </Magnetic>
        </div>
      </div>

      {/* Colophon */}
      <div className="border-t-2 border-ink">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-3">
          {colophon.map((col, i) => (
            <div
              key={col.label}
              className={`p-5 md:p-6 mono text-[10px] text-muted leading-relaxed ${
                i < colophon.length - 1 ? "border-b md:border-b-0 md:border-r border-ink" : ""
              }`}
            >
              <p className="text-signal text-[10px] mb-3">{col.label}</p>
              {col.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t-2 border-ink">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-4 mono text-[10px] text-muted">
          <span>
            © {new Date().getFullYear()} {site.name.toUpperCase()}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-signal animate-pulse" />
            {site.availability.toUpperCase()}
          </span>
          <a href="#top" data-cursor="TOP ↑" className="slash-link text-ink">
            BACK TO TOP ↑
          </a>
        </div>
      </footer>
    </section>
  );
}
