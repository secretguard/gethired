import { InterviewPrepView } from "../components/InterviewPrepView";
import { RoleGate } from "../components/RoleGate";
import { PageHeader } from "../components/ui/PageHeader";

export default function InterviewPrepPage() {
  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <PageHeader
          eyebrow="Real, sourced questions — not AI-generated"
          title="Interview Prep"
          size="md"
          description="Real entry-level interview questions for your track, plus shared behavioral questions — sourced from published interview guides, not invented."
        />
        <div className="mt-10 flex w-full justify-center">
          <InterviewPrepView />
        </div>
      </main>
    </RoleGate>
  );
}
