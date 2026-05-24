import { AuthTabs } from "../AuthTabs";
import { LoginForm } from "./LoginForm";

function LoginMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-border bg-surface p-3 text-sm text-foreground">
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
      ? "Your session expired (for example after a server restart). Please log in again."
      : (message ?? null);

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mb-6 text-sm text-muted">Log in to skip the line.</p>
      <AuthTabs active="login" />
      <LoginMessage message={banner} />
      <LoginForm />
    </div>
  );
}
