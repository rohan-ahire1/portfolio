"use client";

import { ProjectArt } from "@/components/ProjectArt";
import type { Project } from "@/lib/content";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/**
 * The project's art column: static FIG artwork with a "run live insert"
 * strip that swaps in the actual app inside an iframe on demand.
 */
export function LiveInsert({ project }: { project: Project }) {
  const [active, setActive] = useState(false);

  if (!project.demo) {
    return (
      <div className="relative">
        <ProjectArt
          projectId={project.id}
          accent={project.accent}
          number={project.number}
        />
        <Overlays project={project} />
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-cursor-native
            className="border-2 border-ink bg-paper flex flex-col"
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink px-3 py-2 mono text-[10px]">
              <span className="flex items-center gap-2 text-ink">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
                LIVE INSERT — {project.title}
              </span>
              <span className="flex items-center gap-3">
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="slash-link text-muted"
                >
                  OPEN FULL ↗
                </a>
                <button
                  onClick={() => setActive(false)}
                  className="border border-ink px-1.5 py-0.5 invert-hover"
                  aria-label="Close live insert"
                >
                  ✕
                </button>
              </span>
            </div>
            <iframe
              src={project.demo}
              title={`${project.title} — live demo`}
              className="w-full aspect-[4/3] lg:aspect-[4/5] bg-paper-2"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            <div className="border-t border-ink px-3 py-2 mono text-[10px] text-muted">
              THE REAL APP, RUNNING IN THE PAGE. NOT A VIDEO.
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="art"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ProjectArt
              projectId={project.id}
              accent={project.accent}
              number={project.number}
            />
            <button
              onClick={() => setActive(true)}
              data-cursor="PLAY ▶"
              className="display mt-2 w-full border-2 border-ink bg-ink text-paper px-4 py-3 text-sm md:text-base hover:bg-signal hover:border-signal transition-colors duration-300"
            >
              ▶ RUN LIVE INSERT — TRY {project.title}
            </button>
            <Overlays project={project} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Overlays({ project }: { project: Project }) {
  return (
    <>
      <span
        className="num-wash absolute -top-6 -left-1 md:-top-8 md:-left-2 z-10"
        style={{ color: project.accent }}
        aria-hidden
      >
        {project.number}
      </span>
      <div
        className="absolute top-3 right-3 mono text-[11px] px-2 py-1 border bg-paper"
        style={{ borderColor: project.accent, color: project.accent }}
      >
        {project.status}
      </div>
    </>
  );
}
