import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink font-semibold text-paper shadow-card hover:bg-ink/90 hover:shadow-card-hover",
  secondary: "border border-slate/25 bg-paper font-medium text-ink shadow-border hover:border-slate/40 hover:shadow-card-hover",
};

/**
 * Button-styled Link — for navigational CTAs that must render an <a> (so
 * right-click/open-in-new-tab keep working), sharing Button's visual
 * language instead of a `<button>` wrapping a `<Link>` (invalid HTML).
 */
export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: LinkProps & { variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-150 ease-standard active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
