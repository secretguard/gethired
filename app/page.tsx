import { ScanStrip } from "./components/ScanStrip";
import { RoleTrackPicker } from "./components/RoleTrackPicker";
import { ToolCard } from "./components/ToolCard";

const TOOLS = [
  {
    href: "/screen",
    code: "CH.00",
    title: "CV Screener",
    description: "Upload your CV, get a weighted match score against real entry-level postings for your track.",
    cta: "Screen my CV",
  },
  {
    href: "/assessment",
    code: "PA.00",
    title: "Practical Assessment",
    description: "Static, checkpoint-based scenarios — log analysis, networking, vulnerability ID, OWASP, incident response.",
    cta: "Start the assessment",
  },
  {
    href: "/quiz",
    code: "QC.00",
    title: "Quick Knowledge Check",
    description: "A fast, lighter-weight MCQ self-check across the same skill categories.",
    cta: "Take the quiz",
  },
  {
    href: "/roadmap",
    code: "RM.00",
    title: "Roadmap",
    description: "A sequenced next-steps plan combining your CV and assessment gaps — start here once you've used the tools above.",
    cta: "View my roadmap",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
          Rule-based tools — no AI grading
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">GetHired</h1>
        <ScanStrip />
        <p className="text-balance text-base text-slate">
          Break into cybersecurity with honest, rule-based skill assessment and a real roadmap — not just a CV
          scan. Pick a track, then use any tool below in any order.
        </p>
      </div>

      <div className="mt-10 flex w-full flex-col items-center gap-4">
        <RoleTrackPicker />
      </div>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </main>
  );
}
