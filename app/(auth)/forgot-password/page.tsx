import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Werefa",
  description: "Reset your Werefa password",
};

export default function ForgotPasswordPage() {
  return (
    <>
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-muted mt-1">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  </>
  );
}
