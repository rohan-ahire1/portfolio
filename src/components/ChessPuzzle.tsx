"use client";

import { chessPuzzles } from "@/lib/content";
import { motion } from "framer-motion";
import { useState } from "react";

// Print-diagram convention: outline glyphs = white, filled = black, all ink.
const GLYPHS: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const FILES = "abcdefgh";

function parseFen(fen: string): (string | null)[] {
  const board: (string | null)[] = [];
  for (const row of fen.split(" ")[0].split("/")) {
    for (const ch of row) {
      if (/\d/.test(ch)) board.push(...Array(Number(ch)).fill(null));
      else board.push(ch);
    }
  }
  return board; // index 0 = a8 … 63 = h1
}

function squareName(index: number): string {
  return `${FILES[index % 8]}${8 - Math.floor(index / 8)}`;
}

const puzzleIndex = Math.floor(Date.now() / 86_400_000) % chessPuzzles.length;

export function ChessPuzzle() {
  const puzzle = chessPuzzles[puzzleIndex];
  const [board, setBoard] = useState<(string | null)[]>(() => parseFen(puzzle.fen));
  const [selected, setSelected] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const [state, setState] = useState<"playing" | "solved" | "revealed">("playing");
  const [shake, setShake] = useState(0);

  const applySolution = () => {
    setBoard((b) => {
      const next = [...b];
      const fromIdx = next.findIndex((_, i) => squareName(i) === puzzle.from);
      const toIdx = next.findIndex((_, i) => squareName(i) === puzzle.to);
      next[toIdx] = next[fromIdx];
      next[fromIdx] = null;
      return next;
    });
    setSelected(null);
  };

  const clickSquare = (index: number) => {
    if (state !== "playing") return;
    const piece = board[index];
    const isWhitePiece = piece !== null && piece === piece.toUpperCase();

    if (selected === null) {
      if (isWhitePiece) setSelected(index);
      return;
    }
    if (index === selected) {
      setSelected(null);
      return;
    }
    if (isWhitePiece) {
      setSelected(index);
      return;
    }
    if (squareName(selected) === puzzle.from && squareName(index) === puzzle.to) {
      applySolution();
      setState("solved");
    } else {
      setSelected(null);
      setMisses((m) => m + 1);
      setShake((s) => s + 1);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="mono text-[10px] text-muted">
          PUZZLE №{String(puzzleIndex + 1).padStart(2, "0")} · WHITE TO MOVE · MATE IN ONE
        </p>
        {state === "playing" && misses >= 3 && (
          <button
            onClick={() => {
              applySolution();
              setState("revealed");
            }}
            data-cursor="GIVE UP"
            className="mono text-[10px] border border-ink px-2 py-1 invert-hover"
          >
            REVEAL
          </button>
        )}
      </div>

      <motion.div
        key={shake}
        animate={shake > 0 ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
        transition={{ duration: 0.35 }}
        className="grid aspect-square w-full max-w-[420px] grid-cols-8 border-2 border-ink select-none"
      >
        {board.map((piece, i) => {
          const light = (Math.floor(i / 8) + i) % 2 === 0;
          const isSelected = selected === i;
          const isTarget =
            state !== "playing" && squareName(i) === puzzle.to;
          return (
            <button
              key={i}
              onClick={() => clickSquare(i)}
              data-cursor=""
              aria-label={`${squareName(i)}${piece ? ` ${GLYPHS[piece]}` : ""}`}
              className={`relative flex items-center justify-center text-[clamp(1.2rem,3.2vw,1.9rem)] leading-none text-ink ${
                light ? "bg-paper" : "bg-paper-2"
              } ${isSelected ? "outline outline-2 -outline-offset-2 outline-signal" : ""} ${
                isTarget ? "bg-signal/15" : ""
              }`}
            >
              {piece ? GLYPHS[piece] : ""}
            </button>
          );
        })}
      </motion.div>

      <div className="mt-4 min-h-[52px]">
        {state === "playing" && (
          <p className="mono text-[10px] text-muted">
            HINT: {puzzle.hint}
            {misses > 0 && ` · ${misses} MISS${misses > 1 ? "ES" : ""}`}
          </p>
        )}
        {state === "solved" && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="mono text-[11px] bg-signal text-paper px-2 py-1">
              {puzzle.san} — MATE. NICELY DONE.
            </span>
            <a href="#chess-coach" data-cursor="READ" className="mono text-[10px] slash-link">
              YOUR GAMES HAVE PATTERNS TOO → FIG. 02
            </a>
          </div>
        )}
        {state === "revealed" && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="mono text-[11px] border border-ink px-2 py-1">
              THE ANSWER: {puzzle.san}
            </span>
            <a href="#chess-coach" data-cursor="READ" className="mono text-[10px] slash-link">
              COACHMATE FIXES THIS → FIG. 02
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
