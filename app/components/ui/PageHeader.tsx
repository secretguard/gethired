import type { ReactNode } from "react";
import { ScanStrip } from "../ScanStrip";

/**
 * Shared page-header block (eyebrow + title + optional scan strip +
 * description) — every tool page repeated this markup by hand, with no
 * guarantee they'd stay in sync. Centralizing it also means the staggered
 * fade-up entrance is applied consistently everywhere instead of only on
 * the pages someone remembered to add it to.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  size = "lg",
  scanStrip = false,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  size?: "lg" | "md";
  scanStrip?: boolean;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
      <span className="animate-fade-up font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
        {eyebrow}
      </span>
      <h1
        className={`animate-fade-up font-display font-semibold tracking-tight text-ink ${
          size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
        }`}
        style={{ animationDelay: "60ms" }}
      >
        {title}
      </h1>
      {scanStrip && (
        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <ScanStrip />
        </div>
      )}
      <p className="animate-fade-up text-balance text-base text-slate" style={{ animationDelay: scanStrip ? "180ms" : "120ms" }}>
        {description}
      </p>
    </div>
  );
}
