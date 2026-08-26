"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently in view. Pass a stable (module-level)
 * ids array to avoid re-subscribing every render.
 */
export function useActiveSection(ids: string[], rootMargin = "-40% 0px -55% 0px") {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return active;
}
