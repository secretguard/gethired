import { CvScreener } from "../components/CvScreener";
import { RoleGate } from "../components/RoleGate";
import { PageHeader } from "../components/ui/PageHeader";

export default function ScreenPage() {
  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <PageHeader
          eyebrow="Rule-based screening — no AI grading"
          title="CV Screener"
          scanStrip
          description="Know where your CV stands before a recruiter does. Screened against what real entry-level cybersecurity postings for your selected track actually ask for."
        />
        <div className="mt-10 w-full">
          <CvScreener />
        </div>
      </main>
    </RoleGate>
  );
}
