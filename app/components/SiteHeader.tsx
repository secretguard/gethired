"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex w-full flex-wrap items-center justify-between gap-3 bg-paper/85 px-4 py-3 shadow-border backdrop-blur-sm sm:px-6">
      <Link
        href="/"
        className="font-display text-lg font-semibold tracking-tight text-ink transition-opacity duration-150 ease-standard hover:opacity-70"
      >
        GetHired
      </Link>
      <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm font-medium text-slate">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`group relative rounded-md px-2.5 py-1.5 transition-colors duration-150 ease-standard hover:text-ink ${
                active ? "text-ink" : ""
              }`}
            >
              {link.label}
              <span
                className={`absolute inset-x-2.5 -bottom-[1px] h-[2px] origin-left scale-x-0 rounded-full bg-beacon transition-transform duration-200 ease-standard group-hover:scale-x-100 ${
                  active ? "scale-x-100" : ""
                }`}
                aria-hidden
              />
            </Link>
          );
        })}
      </nav>
      <RoleBadge />
    </header>
  );
}
