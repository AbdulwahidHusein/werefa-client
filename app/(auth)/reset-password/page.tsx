import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Reset Password | Werefa",
  description: "Reset your Werefa password",
};

function ResetPasswordFormWrapper() {
  return (
    <>
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted mt-1">
          Enter your new password below.
        </p>
      </div>
      <Suspense
        fallback={<div className="animate-pulse h-40 bg-surface rounded" />}
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  </>
  );
}

export default ResetPasswordFormWrapper;
