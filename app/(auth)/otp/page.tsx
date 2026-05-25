import { redirect } from "next/navigation";

import { OtpVerifyForm } from "./OtpVerifyForm";

export default async function OtpVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: rawEmail } = await searchParams;
  const email = rawEmail?.trim();

  if (!email) {
    redirect("/login/otp");
  }

  return (
    <div className="flex w-full flex-col">
      <h1 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
        Verification code
      </h1>
      <p className="mt-1.5 mb-6 text-center text-sm text-muted">
        Sent to{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <OtpVerifyForm email={email} />
    </div>
  );
}
