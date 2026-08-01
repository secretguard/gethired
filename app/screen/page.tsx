import { CvScreener } from "../components/CvScreener";
import { ScanStrip } from "../components/ScanStrip";

export default function ScreenPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
            Rule-based screening — no AI grading
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">CV Screener</h1>
          <ScanStrip />
        </div>
        <p className="text-balance text-base text-slate">
          Know where your CV stands before a recruiter does. Screened against what real entry-level cybersecurity
          postings — SOC analyst, VAPT, network security, or a general fresher role — actually ask for, weighted
          for the track you pick above.
        </p>
      </div>
      <div className="mt-10 w-full">
        <CvScreener />
      </div>
    </main>
  );
}
