import { McqQuiz } from "../components/McqQuiz";
import { RoleGate } from "../components/RoleGate";
import { PageHeader } from "../components/ui/PageHeader";

export default function QuizPage() {
  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <PageHeader
          eyebrow="Rule-based quiz — no AI grading"
          title="Quick Check"
          size="md"
          description="A fast, lighter-weight self-check across the same skill categories the CV screener and practical assessment use."
        />
        <div className="mt-10 flex w-full justify-center">
          <McqQuiz />
        </div>
      </main>
    </RoleGate>
  );
}
