import Link from "next/link";

export function ToolCard({
  href,
  code,
  title,
  description,
  cta,
}: {
  href: string;
  code: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-slate/15 bg-paper p-6 text-left transition hover:border-beacon"
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">{code}</span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate">{description}</p>
      <span className="mt-2 text-sm font-medium text-beacon transition group-hover:underline">{cta} →</span>
    </Link>
  );
}
