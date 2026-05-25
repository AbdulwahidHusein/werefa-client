import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Werefa",
  description: "Reset your Werefa password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full flex-col space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          We&apos;ll email you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
