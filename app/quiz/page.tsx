import { McqQuiz } from "../components/McqQuiz";

export default function QuizPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
          Rule-based quiz — no AI grading
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Quick Check</h1>
        <p className="text-balance text-base text-slate">
          A fast, lighter-weight self-check across the same skill categories the CV screener and practical
          assessment use.
        </p>
      </div>
      <div className="mt-10 flex w-full justify-center">
        <McqQuiz />
      </div>
    </main>
  );
}
