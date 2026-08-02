import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "rounded-lg bg-ink font-semibold text-paper shadow-card hover:bg-ink/90 hover:shadow-card-hover",
  secondary:
    "rounded-lg border border-slate/25 bg-paper font-medium text-ink shadow-border hover:border-slate/40 hover:shadow-card-hover",
  ghost: "rounded-lg font-medium text-slate hover:text-ink",
};

/**
 * Shared button primitive so every CTA in the app gets the same
 * hover/press/focus feedback for free. `active:scale-[0.97]` is the one
 * micro-interaction the previous UI had nowhere — every button was
 * hover-color-only with no response to being pressed.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>(
  ({ variant = "primary", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-all duration-150 ease-standard active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
