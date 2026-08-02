import { ScanLoader } from "./ui/ScanLoader";

const STEPS = ["Reading your CV", "Matching against real job-posting keywords", "Scoring each category"];

/**
 * Brief transition shown while /api/screen is scoring. Copy is deliberately
 * honest — this is a real (if fast) keyword-matching pass against the
 * static corpus, never an "AI analyzing your resume" claim.
 */
export function ScoringTransition() {
  return (
    <ScanLoader
      eyebrow="Scoring against real job-posting data — no live AI analysis"
      steps={STEPS}
      compact={false}
    />
  );
}
