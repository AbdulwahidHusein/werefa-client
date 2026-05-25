import { WerefaLogo } from "@/components/WerefaLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col px-6 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
      <header className="mb-10">
        <WerefaLogo variant="full" size="md" href="/" />
      </header>
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
