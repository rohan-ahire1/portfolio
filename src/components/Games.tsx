"use client";

import dynamic from "next/dynamic";

// Client-only: both widgets pick their daily item from the wall clock.
const ChessPuzzle = dynamic(
  () => import("@/components/ChessPuzzle").then((m) => m.ChessPuzzle),
  { ssr: false },
);
const FlagQuiz = dynamic(
  () => import("@/components/FlagQuiz").then((m) => m.FlagQuiz),
  { ssr: false },
);

export function Games() {
  return (
    <section id="games" className="border-b-2 border-ink">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <p className="mono text-[11px] text-muted mb-3">
              SECTION 05 — THE GAMES PAGE
            </p>
            <h2 className="display text-[clamp(2.5rem,8vw,5rem)]">
              DAILY
              <br />
              DRILLS
            </h2>
          </div>
          <p className="max-w-sm text-sm md:text-base text-muted leading-relaxed">
            One chess puzzle, one flag. A new pair every day, pulled straight
            from two of the projects above.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-7 border-2 border-ink p-5 md:p-8 bg-paper">
            <ChessPuzzle />
          </div>
          <div className="lg:col-span-5 border-2 border-ink p-5 md:p-8 bg-paper">
            <FlagQuiz />
          </div>
        </div>
      </div>
    </section>
  );
}
