import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const base =
  "inline-flex h-12 min-h-12 w-full cursor-pointer items-center justify-center rounded-lg px-5 text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary:
    "border border-border bg-background text-foreground hover:bg-surface",
  ghost: "text-muted hover:text-foreground",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-surface",
  danger:
    "border border-rose-200 bg-background text-rose-800 hover:bg-rose-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className}`} />
  );
}
