"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

import { OtpCodeInput } from "@/components/OtpCodeInput";
import { Button } from "@/components/ui/Button";
import { requestOtpAction, verifyOtpAction } from "./actions";

export function OtpVerifyForm({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
  const [resendCooldown, setResendCooldown] = useState(30); // 30s initial cooldown
  const [resendsRemaining, setResendsRemaining] = useState(3);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // 1. Countdown Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Format expiry timer (M:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 3. Handle Code Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || timeLeft === 0 || isPending) return;

    setErrorMessage("");
    startTransition(async () => {
      const result = await verifyOtpAction(email, code);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        // Force fully refreshed route to / (dashboard) to reloaddal cookies
        window.location.href = "/";
      }
    });
  }

  // 4. Handle Code Resend
  async function handleResend() {
    if (resendsRemaining <= 0 || resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      const res = await requestOtpAction(undefined, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setResendsRemaining((prev) => prev - 1);
        setResendCooldown(30);
        setTimeLeft(600);
        setCode("");
      }
    } catch {
      setErrorMessage("Failed to resend code. Try again.");
    } finally {
      setIsResending(false);
    }
  }

  const isExpired = timeLeft === 0;

  return (
    <>
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-950 p-3.5 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {/* Code Input boxes */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
          Verification Code
        </label>
        <OtpCodeInput value={code} onChange={setCode} disabled={isExpired || isPending} />
      </div>

      {/* Countdown Timer details */}
      <div className="flex items-center justify-between text-xs px-0.5">
        {isExpired ? (
          <span className="font-semibold text-rose-600">Code expired, request new code</span>
        ) : (
          <span className="text-muted">
            Expires in <span className="font-mono font-bold text-foreground">{formatTime(timeLeft)}</span>
          </span>
        )}

        {resendsRemaining > 0 ? (
          <span className="text-muted">
            {resendsRemaining} resends remaining
          </span>
        ) : (
          <span className="text-rose-600 font-semibold">
            Resend limit reached
          </span>
        )}
      </div>

      {/* Verify Submit Button */}
      <Button
        type="submit"
        disabled={code.length !== 6 || isExpired || isPending}
        className="h-11 text-sm font-semibold flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying Code...
          </>
        ) : (
          "Verify & Sign In"
        )}
      </Button>

      {/* Resend Controls */}
      <div className="flex flex-col gap-3 items-center mt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendsRemaining <= 0 || isResending}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          {isResending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Resending...
            </>
          ) : resendCooldown > 0 ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin text-muted" />
              Resend code in {resendCooldown}s
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              Resend verification code
            </>
          )}
        </button>

        <Link
          href="/login/otp"
          className="text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          ← Use different email
        </Link>
      </div>
    </form>
  </>
  );
}
