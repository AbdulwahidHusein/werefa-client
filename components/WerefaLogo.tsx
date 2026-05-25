import Image from "next/image";
import Link from "next/link";

/** Single brand asset: public/brand/logo.png */
export const LOGO_SRC = "/brand/logo.png";
const LOGO_ASPECT = 1230 / 939;

function logoDimensions(width: number) {
  return { w: width, h: Math.max(1, Math.round(width / LOGO_ASPECT)) };
}

type WerefaLogoProps = {
  size?: "auth" | "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  onClick?: () => void;
};

const WIDTHS = {
  auth: 88,
  sm: 120,
  md: 168,
  lg: 210,
} as const;

export function WerefaLogo({
  size = "md",
  href = "/",
  className = "",
  onClick,
}: WerefaLogoProps) {
  const width = WIDTHS[size];
  const dim = logoDimensions(width);
  const centered = className.includes("justify-center") || className.includes("mx-auto");
  const isAuth = size === "auth";

  const img = (
    <span
      className={`inline-flex items-center ${
        isAuth
          ? "w-full max-w-[5.5rem] sm:max-w-[6.5rem] md:max-w-[7.25rem]"
          : "w-auto"
      } ${className}`.trim()}
      style={!isAuth ? { maxWidth: dim.w } : undefined}
    >
      <Image
        src={LOGO_SRC}
        alt="Werefa"
        width={dim.w}
        height={dim.h}
        className={`h-auto w-full shrink-0 object-contain ${
          centered ? "object-center" : "object-left"
        }`}
        priority={size === "auth" || size === "md"}
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`inline-flex rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          centered ? "mx-auto" : ""
        }`}
      >
        {img}
      </Link>
    );
  }

  return img;
}
