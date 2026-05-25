import { WerefaLogo } from "@/components/WerefaLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <div className="flex w-full max-w-sm flex-col">
        <header className="mb-4 flex justify-center sm:mb-5">
          <WerefaLogo size="auth" href="/" className="justify-center" />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
