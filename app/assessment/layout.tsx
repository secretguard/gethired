import type { Metadata } from "next";

const TITLE = "Practical Assessment — GetHired | Sarath G";
const DESCRIPTION =
  "Checkpoint-based cybersecurity scenarios covering log analysis, networking, vulnerability identification, OWASP, and incident response. No AI grading.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/assessment" },
  openGraph: {
    url: "/assessment",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og/assessment.png", width: 1200, height: 630, alt: "Practical assessment | Sarath G" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/assessment.png"] },
};

export default function AssessmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
