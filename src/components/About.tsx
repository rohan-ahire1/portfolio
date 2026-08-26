"use client";

import { site, skills } from "@/lib/content";
import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="border-b-2 border-ink">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="mono text-[11px] text-muted mb-3">
              SECTION 03 — ABOUT
            </p>
            <h2 className="display text-[clamp(2.5rem,8vw,5rem)] mb-6">
              THE
              <br />
              BUILDER
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left" }}
              className="rule-thick mb-6 max-w-[80px]"
            />
            <p className="mono text-[11px] text-muted">
              {site.location}
              <br />
              {site.role}
            </p>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl md:text-3xl leading-snug text-ink-soft max-w-3xl"
            >
              {site.bio}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-2 border-ink">
              {skills.map((s, i) => (
                <motion.div
                  key={s.group}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`p-5 md:p-6 ${
                    i % 2 === 0 ? "sm:border-r border-ink" : ""
                  } ${i < 2 ? "border-b border-ink" : ""}`}
                >
                  <p className="mono text-[10px] text-signal mb-3">{s.group}</p>
                  <ul className="space-y-1.5">
                    {s.items.map((item) => (
                      <li
                        key={item}
                        className="display text-lg md:text-xl tracking-tight"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="mono text-[11px] border border-ink px-4 py-2 invert-hover"
              >
                GitHub ↗
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mono text-[11px] border border-ink px-4 py-2 invert-hover"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
