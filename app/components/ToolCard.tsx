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
      className="group flex flex-col gap-2 rounded-2xl bg-paper p-6 text-left shadow-border transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:scale-[0.99]"
    >
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70 transition-colors duration-150 ease-standard group-hover:text-beacon">
        {code}
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate">{description}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-beacon">
        {cta}
        <span className="transition-transform duration-150 ease-standard group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
