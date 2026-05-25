import { AuthTabs } from "../AuthTabs";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="flex w-full flex-col">
      <h1 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Create account
      </h1>
      <p className="mt-1.5 mb-6 text-center text-sm text-muted">
        Join as a customer or business
      </p>
      <AuthTabs active="signup" />
      <SignupForm />
      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        By signing up you agree to our terms of service.
      </p>
    </div>
  );
}
