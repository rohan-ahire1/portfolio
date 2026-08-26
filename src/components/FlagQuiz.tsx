"use client";

import { flagQuestions } from "@/lib/content";
import { motion } from "framer-motion";
import { useState } from "react";

const questionIndex = Math.floor(Date.now() / 86_400_000) % flagQuestions.length;

export function FlagQuiz() {
  const question = flagQuestions[questionIndex];
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const done = picked !== null;
  const correct = picked === question.answer;

  return (
    <div className="flex h-full flex-col">
      <p className="mono text-[10px] text-muted mb-4">
        FLAG №{String(questionIndex + 1).padStart(2, "0")} · WHOSE COLOURS ARE THESE?
      </p>

      <motion.div
        key={shake}
        animate={shake > 0 ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
        transition={{ duration: 0.35 }}
        className="flex flex-1 flex-col"
      >
        <div className="flex items-center justify-center border-2 border-ink bg-paper-2 py-8 md:py-10 mb-4">
          <span className="text-[clamp(3.5rem,8vw,5.5rem)] leading-none" aria-hidden>
            {question.flag}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {question.options.map((option) => {
            const isAnswer = option === question.answer;
            const isPicked = option === picked;
            return (
              <button
                key={option}
                data-cursor=""
                disabled={done}
                onClick={() => {
                  setPicked(option);
                  if (option !== question.answer) setShake((s) => s + 1);
                }}
                className={`mono text-[10px] border border-ink px-2 py-2.5 text-left transition-colors duration-200 ${
                  done && isAnswer
                    ? "bg-ink text-paper"
                    : done && isPicked
                      ? "bg-signal text-paper border-signal line-through"
                      : done
                        ? "opacity-40"
                        : "invert-hover"
                }`}
              >
                {option.toUpperCase()}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-4 min-h-[32px]">
        {done &&
          (correct ? (
            <span className="mono text-[11px] bg-ink text-paper px-2 py-1">
              CORRECT. YOU&apos;D SURVIVE A FLAGGO STREAK.
            </span>
          ) : (
            <span className="mono text-[11px]">
              <span className="bg-signal text-paper px-2 py-1">WRONG.</span>{" "}
              <a href="#flaggo" data-cursor="READ" className="slash-link">
                STUDY MORE → FIG. 01
              </a>
            </span>
          ))}
      </div>
    </div>
  );
}
