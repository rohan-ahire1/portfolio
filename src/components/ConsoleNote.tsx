"use client";

import { site } from "@/lib/content";
import { useEffect } from "react";

let logged = false;

export function ConsoleNote() {
  useEffect(() => {
    if (logged) return;
    logged = true;
    console.log(
      "%c ROHAN. %c VOL. 01 — PERSONAL ISSUE %c\n\nInspecting the source? Correct instinct.\nThe whole thing is hand-set Next.js + Tailwind — no template.\nWant to talk shop? " +
        site.email,
      "background:#e10600;color:#f2ede4;font-family:monospace;font-size:14px;padding:4px 8px;",
      "background:#0c0c0c;color:#f2ede4;font-family:monospace;font-size:14px;padding:4px 8px;",
      "color:#6b655c;font-family:monospace;font-size:12px;",
    );
  }, []);

  return null;
}
