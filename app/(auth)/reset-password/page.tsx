import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Reset Password | Werefa",
  description: "Reset your Werefa password",
};

function ResetPasswordFormWrapper() {
  return (
    <>
    <div className="flex w-full flex-col space-y-5">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Reset password
        </h1>
        <p className="mt-1.5 text-sm text-muted">Choose a new password</p>
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
