import { AuthTabs } from "../AuthTabs";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <>
    <div className="flex flex-1 flex-col">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mb-6 text-sm text-muted">
        It takes a few seconds.
      </p>
      <AuthTabs active="signup" />
      <SignupForm />
      <p className="mt-6 text-center text-xs text-muted">
        By creating an account you agree to our terms.
      </p>
    </div>
  </>
  );
}
