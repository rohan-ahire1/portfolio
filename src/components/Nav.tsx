"use client";

import { contactHref, site } from "@/lib/content";
import { useActiveSection } from "@/lib/useActiveSection";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#now", label: "Now" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = ["work", "about", "now", "contact"];

export function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 40);
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className={`fixed top-0 inset-x-0 z-40 border-b border-ink transition-colors duration-300 ${
        solid || open ? "bg-paper/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <a href="#top" className="display text-xl tracking-tight md:text-2xl">
          {site.handle}
          <span className="text-signal">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-cursor="JUMP"
              className={`mono text-[11px] text-ink slash-link ${
                active === l.href.slice(1) ? "slash-link-active" : ""
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={contactHref}
            data-cursor="WRITE"
            className="mono hidden sm:inline-block text-[10px] md:text-[11px] border border-ink px-3 py-1.5 invert-hover"
          >
            {site.availability}
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="mono md:hidden text-[10px] border border-ink px-3 py-1.5 invert-hover"
          >
            {open ? "CLOSE" : "MENU"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-[49px] z-40 flex flex-col bg-paper md:hidden"
          >
            <nav className="flex flex-col">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`display text-4xl px-6 py-5 border-b border-ink ${
                    active === l.href.slice(1) ? "text-signal" : "text-ink"
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <a
              href={contactHref}
              onClick={() => setOpen(false)}
              className="mono text-[11px] px-6 py-6 text-muted"
            >
              {site.availability} →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
