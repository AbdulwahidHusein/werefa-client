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
    <div className="flex flex-1 flex-col">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Enter verification code
      </h1>
      <p className="mb-6 text-sm text-muted">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-foreground">{email}</span>.
      </p>

      <OtpVerifyForm email={email} />
    </div>
  );
}
