import { AuthTabs } from "../AuthTabs";
import { LoginForm } from "./LoginForm";

function LoginMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl border border-border bg-surface px-3 py-2.5 text-center text-sm text-foreground">
      {message}
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; session?: string }>;
}) {
  const { message, session } = await searchParams;
  const banner =
    session === "expired"
      ? "Your session expired. Please log in again."
      : (message ?? null);

  return (
    <div className="flex w-full flex-col">
      <h1 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Welcome back
      </h1>
      <p className="mt-1.5 mb-6 text-center text-sm text-muted">
        Log in to skip the line
      </p>
      <AuthTabs active="login" />
      <LoginMessage message={banner} />
      <LoginForm />
    </div>
  );
}
