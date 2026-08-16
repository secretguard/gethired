import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Roadmap — GetHired | Sarath G",
  description:
    "A sequenced, step-by-step cybersecurity career plan built from your CV Screener and Practical Assessment results — start at step 1, work down.",
};

export default function RoadmapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
