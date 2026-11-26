"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { getQuizSet } from "@/lib/learning/quizzes";
import { cn } from "@/lib/utils";

export default function QuizPlayerPage() {
  const params = useParams();
  const quizId = String(params.quizId || "");
  const set = useMemo(() => getQuizSet(quizId), [quizId]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!set) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">Quiz not found.</p>
        <Link href="/learning/quiz" className="mt-4 inline-block font-semibold text-[#1d2d5c]">
          Back to quizzes
        </Link>
      </div>
    );
  }

  const q = set.questions[index];
  const isCorrect = selected === q.correctId;

  const onCheck = () => {
    if (!selected || revealed) return;
    setRevealed(true);
    if (selected === q.correctId) setScore((s) => s + 1);
  };

  const onNext = () => {
    if (index + 1 >= set.questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const onRestart = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className="text-2xl font-bold text-slate-900">Workout complete</h1>
        <p className="text-slate-600">
          You scored <strong className="text-slate-900">{score}</strong> of{" "}
          <strong className="text-slate-900">{set.questions.length}</strong> on {set.title}.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/learning/quiz"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162447]"
          >
            More quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/learning/quiz" className="font-semibold text-[#1d2d5c] hover:underline">
          ← All quizzes
        </Link>
        <span className="text-slate-500">
          Question {index + 1} / {set.questions.length} · Score {score}
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#07649d]">{q.topic}</p>
        <h1 className="mt-2 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
          {q.prompt}
        </h1>

        <ul className="mt-6 space-y-2">
          {q.choices.map((c) => {
            const active = selected === c.id;
            const showCorrect = revealed && c.id === q.correctId;
            const showWrong = revealed && active && c.id !== q.correctId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                    showCorrect && "border-emerald-300 bg-emerald-50",
                    showWrong && "border-red-200 bg-red-50",
                    !revealed && active && "border-[#1d2d5c] bg-[#eef2ff]",
                    !revealed && !active && "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    revealed && !showCorrect && !showWrong && "opacity-70"
                  )}
                >
                  <span className="mt-0.5">
                    {showCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : showWrong ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Circle className={cn("h-5 w-5", active ? "text-[#1d2d5c]" : "text-slate-300")} />
                    )}
                  </span>
                  <span className="font-medium text-slate-800">{c.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <Lightbulb className="h-4 w-4" />
              {isCorrect ? "Correct" : "Explanation"}
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-950/90">{q.explanation}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {!revealed ? (
            <button
              type="button"
              disabled={!selected}
              onClick={onCheck}
              className="rounded-xl bg-[#1d2d5c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="rounded-xl bg-[#1d2d5c] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {index + 1 >= set.questions.length ? "See results" : "Next question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
