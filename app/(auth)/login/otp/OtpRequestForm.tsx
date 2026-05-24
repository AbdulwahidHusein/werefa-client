"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";

import { requestOtpAction, type OtpState } from "../../otp/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const initial: OtpState = undefined;

export function OtpRequestForm() {
  const [state, action, pending] = useActionState(requestOtpAction, initial);

  return (
    <>
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.email}
        placeholder="you@example.com"
      />

      {state?.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending Code...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Send Verification Code
          </>
        )}
      </Button>

      <div className="flex justify-center mt-2">
        <Link
          href="/login"
          className="text-xs font-semibold text-accent hover:underline transition-colors"
        >
          Sign in with password instead →
        </Link>
      </div>
    </form>
  </>
  );
}
