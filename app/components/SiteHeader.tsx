import Link from "next/link";
import { RoleBadge } from "./RoleBadge";

const NAV_LINKS = [
  { href: "/screen", label: "CV Screener" },
  { href: "/assessment", label: "Assessment" },
  { href: "/quiz", label: "Quiz" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/interview-prep", label: "Interview Prep" },
  { href: "/resources", label: "Resources" },
];

export function SiteHeader() {
  return (
    <header className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-slate/10 bg-paper px-4 py-3 sm:px-6">
      <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
        GetHired
      </Link>
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>
      <RoleBadge />
    </header>
  );
}
