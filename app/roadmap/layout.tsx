import type { Metadata } from "next";

const TITLE = "Career Roadmap — GetHired | Sarath G";
const DESCRIPTION =
  "A sequenced, step-by-step cybersecurity career plan built from your CV Screener and Practical Assessment results — start at step 1, work down.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/roadmap" },
  openGraph: {
    url: "/roadmap",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og/roadmap.png", width: 1200, height: 630, alt: "Your career roadmap | Sarath G" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/roadmap.png"] },
};

export default function RoadmapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
