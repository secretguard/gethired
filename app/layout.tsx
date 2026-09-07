import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { RoleProvider } from "./context/RoleContext";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SITE_DESCRIPTION =
  "Break into cybersecurity with honest, rule-based skill assessment, a practical exam, and a real roadmap — not just a CV scan. No AI grading, no login.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gethired.sarathg.me"),
  alternates: { canonical: "/" },
  title: "GetHired — Free Cybersecurity Career Tools | Sarath G",
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "GetHired",
    url: "/",
    title: "GetHired — Free Cybersecurity Career Tools | Sarath G",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: "Free cybersecurity career tools | Sarath G" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetHired — Free Cybersecurity Career Tools | Sarath G",
    description: SITE_DESCRIPTION,
    images: ["/og/default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google tag (gtag.js) — afterInteractive so it loads without blocking
            first render; tracking ID and config calls kept exactly as provided. */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ML4GP9590F" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ML4GP9590F');
          `}
        </Script>
        <RoleProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </RoleProvider>
      </body>
    </html>
  );
}
