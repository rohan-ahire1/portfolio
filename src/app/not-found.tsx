import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mono text-[11px] text-muted mb-4">
        VOL. 01 — PAGE UNACCOUNTED FOR
      </p>
      <h1 className="display text-[clamp(5rem,25vw,18rem)] text-ink leading-none">
        4<span className="text-signal">0</span>4
      </h1>
      <div className="rule-thick my-8 max-w-[120px] w-full" />
      <p className="text-xl md:text-2xl text-ink-soft max-w-md mb-10">
        This page is not in this issue. It may have been cut in editing.
      </p>
      <Link
        href="/"
        className="display text-sm md:text-base border-2 border-ink bg-ink text-paper px-5 py-3 hover:bg-signal hover:border-signal transition-colors duration-300"
      >
        BACK TO THE FRONT PAGE →
      </Link>
    </main>
  );
}
