"use client";

import { projects, type Project } from "@/lib/content";
import { LiveInsert } from "@/components/LiveInsert";
import { Magnetic } from "@/components/Magnetic";
import { useActiveSection } from "@/lib/useActiveSection";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const projectIds = projects.map((p) => p.id);

function ProjectSpread({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yNum = useTransform(scrollYProgress, [0, 1], [40, -60]);
  const yContent = useTransform(scrollYProgress, [0, 1], [30, -20]);
  const flip = index % 2 === 1;

  return (
    <article
      ref={ref}
      id={project.id}
      data-cursor-zone={project.id}
      className="relative border-b-2 border-ink"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Art column */}
        <motion.div
          style={{ y: yNum }}
          className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}
        >
          <LiveInsert project={project} />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ y: yContent }}
          className={`lg:col-span-7 flex flex-col justify-between gap-8 ${
            flip ? "lg:order-1" : ""
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="mono text-[10px] text-muted">{project.year}</span>
              <span className="h-px w-8 bg-ink" />
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="mono text-[10px] border border-ink px-2 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="display text-[clamp(2.5rem,8vw,6.5rem)] mb-3"
            >
              {project.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-2xl text-ink-soft mb-6 max-w-2xl"
            >
              {project.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base md:text-lg leading-relaxed text-muted max-w-2xl"
            >
              {project.blurb}
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-ink pt-6">
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="mono text-[10px] bg-paper-2 px-2 py-1 border border-ink/20"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              {project.github && (
                <Magnetic>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="CODE ↗"
                    className="display text-sm border-2 border-ink px-4 py-2 invert-hover inline-block"
                  >
                    SOURCE ↗
                  </a>
                </Magnetic>
              )}
              {project.live && (
                <Magnetic>
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="VISIT ↗"
                    className="display text-sm border-2 border-ink bg-ink text-paper px-4 py-2 hover:bg-signal hover:border-signal transition-colors inline-block"
                  >
                    LIVE ↗
                  </a>
                </Magnetic>
              )}
              {!project.live && !project.github && (
                <span className="mono text-[10px] text-muted self-center">
                  Private / local
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accent strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: project.accent }}
        aria-hidden
      />
    </article>
  );
}

export function Work() {
  const activeProject = useActiveSection(projectIds);

  return (
    <section id="work" className="relative">
      {/* Section masthead */}
      <div className="border-b-2 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10 md:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mono text-[11px] text-paper/60 mb-3">
                SECTION 02 — SELECTED WORK
              </p>
              <h2 className="display text-[clamp(2.5rem,10vw,7rem)]">
                SIX BUILDS
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
                className="mt-4 h-[3px] max-w-[120px] bg-signal"
              />
            </div>
            <p className="max-w-sm text-sm md:text-base text-paper/70 leading-relaxed">
              Trading systems, games, a chess coach, document AI, an Android
              utility — each taken from idea to working software.
            </p>
          </div>
        </div>
      </div>

      {/* Index strip */}
      <div className="border-b-2 border-ink overflow-x-auto lg:sticky lg:top-[49px] z-30 bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 flex min-w-max md:min-w-0 md:flex-wrap">
          {projects.map((p) => {
            const isActive = activeProject === p.id;
            return (
              <a
                key={p.id}
                href={`#${p.id}`}
                data-cursor="JUMP"
                className={`group flex items-center gap-3 border-r border-ink px-4 py-4 transition-colors duration-300 ${
                  isActive ? "bg-ink text-paper" : "hover:bg-ink hover:text-paper"
                }`}
              >
                <span
                  className={`mono text-[10px] ${
                    isActive ? "text-paper/50" : "text-muted group-hover:text-paper/50"
                  }`}
                >
                  {p.number}
                </span>
                <span className="display text-sm md:text-base">{p.title}</span>
              </a>
            );
          })}
        </div>
      </div>

      {projects.map((p, i) => (
        <ProjectSpread key={p.id} project={p} index={i} />
      ))}
    </section>
  );
}
