"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, RefreshCw, QrCode, Check, Loader2, Key, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getAccessCodeAction, rotateAccessCodeAction } from "@/app/dashboard/services/[serviceId]/queue/actions";

function generateRandomCode(): string {
  // Alphanumeric excluding confusing chars like 0, O, I, 1
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function AccessCodeDisplay({ providerId }: { providerId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function fetchCode() {
    setError("");
    setLoading(true);
    const res = await getAccessCodeAction(providerId);
    setLoading(false);
    if (res.ok) {
      setCode(res.accessCode || "");
    } else {
      setError(res.error || "Failed to load access code.");
    }
  }

  useEffect(() => {
    fetchCode();
  }, [providerId]);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleRotate() {
    if (isPending) return;
    setError("");
    const newCode = generateRandomCode();

    startTransition(async () => {
      const res = await rotateAccessCodeAction(providerId, newCode);
      if (res.ok) {
        setCode(res.accessCode || "");
      } else {
        setError(res.error || "Failed to rotate access code.");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex h-28 items-center justify-center rounded-2xl border border-border bg-background p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-background p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Access Code</h3>
            <p className="text-[10px] text-muted font-medium">Share this code with remote joining customers</p>
          </div>
        </div>

        {/* Rotate and QR Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className={`p-1.5 rounded-lg border border-border transition-colors cursor-pointer ${
              showQr ? "bg-accent/10 text-accent border-accent/30" : "bg-surface hover:bg-zinc-100 text-muted"
            }`}
            title="Toggle QR Code"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            disabled={isPending}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-zinc-100 text-muted transition-colors cursor-pointer disabled:opacity-50"
            title="Rotate / Refresh Access Code"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-1.5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-950">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : null}

      {!error && (
        <div className="flex flex-col items-center gap-4">
          {code ? (
            <div className="flex w-full items-center gap-3">
              <div className="flex-1 font-mono text-center tracking-widest text-2xl font-bold bg-surface border border-border px-5 py-2.5 rounded-2xl text-accent shadow-inner select-all">
                {code}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-background text-muted hover:bg-surface active:scale-95 transition-all cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-emerald-600 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-5 w-5 hover:text-foreground" />
                )}
              </button>
            </div>
          ) : (
            <div className="text-xs font-semibold text-muted py-2 text-center w-full bg-surface border border-dashed border-border rounded-2xl">
              No active access code. Click refresh to generate.
            </div>
          )}

          {/* QR Code Container */}
          {showQr && code && (
            <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border bg-surface/50 w-full animate-in slide-in-from-top-2 duration-200">
              <div className="rounded-xl border-4 border-white bg-white p-1.5 shadow-sm">
                <QRCodeSVG
                  value={`${window.location.origin}/join?code=${code}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[10px] text-center text-muted font-semibold max-w-[200px] leading-relaxed">
                Customers can scan to join with code automatically
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
