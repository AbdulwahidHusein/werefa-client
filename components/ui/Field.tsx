import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, id, className = "", ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        id={inputId}
        {...rest}
        className={`block h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-zinc-200 ${className}`}
      />
    </label>
  );
}
