import Image from "next/image";
import Link from "next/link";

/** Source file: public/brand/logo.png (full artwork — do not crop for UI) */
const LOGO_SRC = "/brand/logo.png";
const LOGO_ASPECT = 471 / 302;

function logoDimensions(width: number) {
  return { w: width, h: Math.max(1, Math.round(width / LOGO_ASPECT)) };
}

type WerefaLogoProps = {
  /** Smaller mark in sidebars vs larger header lockup */
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  onClick?: () => void;
};

const WIDTHS = {
  full: { sm: 120, md: 168, lg: 210 },
  mark: { sm: 100, md: 128, lg: 148 },
} as const;

export function WerefaLogo({
  variant = "full",
  size = "md",
  href = "/",
  className = "",
  onClick,
}: WerefaLogoProps) {
  const width = WIDTHS[variant][size];
  const dim = logoDimensions(width);

  const img = (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <Image
        src={LOGO_SRC}
        alt="Werefa"
        width={dim.w}
        height={dim.h}
        className="h-auto w-auto max-w-full shrink-0 object-contain object-left"
        priority={variant === "full" && size === "md"}
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {img}
      </Link>
    );
  }

  return img;
}
