import { AuthTabs } from "../../AuthTabs";
import { OtpRequestForm } from "./OtpRequestForm";

export default function OtpLoginPage() {
  return (
    <div className="flex w-full flex-col">
      <h1 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
        Welcome back
      </h1>
      <p className="mt-1.5 mb-6 text-center text-sm text-muted">
        Sign in with a one-time code
      </p>

      <AuthTabs active="login" />

      <OtpRequestForm />
    </div>
  );
}
