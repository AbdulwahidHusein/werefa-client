"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "default" | "hero" | "upload";

const sizeClasses: Record<Size, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-20 w-20 text-lg",
  xl: "h-28 w-28 text-2xl sm:h-32 sm:w-32 sm:text-3xl",
};

const iconSizes: Record<Size, string> = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
  xl: "h-10 w-10",
};

export function ProviderLogo({
  name,
  imageUrl,
  size = "md",
  variant = "default",
  className = "",
}: {
  name: string;
  imageUrl?: string | null;
  size?: Size;
  variant?: Variant;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const dims = sizeClasses[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const showImage = imageUrl && !failed;

  const shellClass =
    variant === "hero"
      ? "rounded-2xl border-2 border-white/25 bg-white shadow-xl ring-4 ring-white/15"
      : variant === "upload"
        ? "rounded-2xl border-2 border-border bg-white shadow-md"
        : "rounded-2xl border border-border bg-white shadow-sm";

  const imgFit = variant === "default" ? "object-cover" : "object-contain p-1.5";

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${shellClass} ${dims} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${name} logo`}
          className={`h-full w-full ${imgFit}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 via-accent/10 to-transparent font-bold text-accent ${
            variant === "hero" ? "text-3xl" : ""
          }`}
        >
          {initial !== "?" ? (
            <span aria-hidden>{initial}</span>
          ) : (
            <Building2 className={iconSizes[size]} aria-hidden />
          )}
        </div>
      )}
    </div>
  );
}
