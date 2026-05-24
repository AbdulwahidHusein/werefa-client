import Link from "next/link";
import { Suspense } from "react";

import { AuthTabs } from "../../AuthTabs";
import { OtpRequestForm } from "./OtpRequestForm";

export default function OtpLoginPage() {
  return (
    <>
    <div className="flex flex-1 flex-col">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mb-6 text-sm text-muted">Log in using a one-time code sent to your email.</p>
      
      <AuthTabs active="login" />

      <OtpRequestForm />
    </div>
  </>
  );
}
