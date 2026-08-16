import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practical Assessment — GetHired | Sarath G",
  description:
    "Checkpoint-based cybersecurity scenarios covering log analysis, networking, vulnerability identification, OWASP, and incident response. No AI grading.",
};

export default function AssessmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
