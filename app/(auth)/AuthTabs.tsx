import Link from "next/link";

type Mode = "login" | "signup";

export function AuthTabs({ active }: { active: Mode }) {
  const tab = (mode: Mode, label: string, href: string) => {
    const isActive = mode === active;
    return (
      <Link
        href={href}
        className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium transition-colors sm:h-10 ${
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };
  return (
    <div className="mb-5 flex gap-1 rounded-xl border border-border bg-surface/80 p-1">
      {tab("login", "Log in", "/login")}
      {tab("signup", "Sign up", "/signup")}
    </div>
  );
}
