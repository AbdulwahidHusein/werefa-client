import { CheckCircle2, Circle } from "lucide-react";

import { kindLabel, REQUIRED_KINDS } from "@/lib/verification-documents";
import type { VerificationRequirements } from "@/lib/verification-documents";

export function VerificationChecklist({
  requirements,
}: {
  requirements: VerificationRequirements | null;
}) {
  const uploaded = new Set(requirements?.uploaded_kinds ?? []);
  const isVerified = requirements?.is_verified === true;

  if (isVerified) {
    const allOnFile = REQUIRED_KINDS.every((k) => uploaded.has(k));
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-xs text-emerald-950">
        <p className="font-semibold">Verified by Werefa</p>
        <p className="mt-1 leading-relaxed text-emerald-900/90">
          {allOnFile
            ? "All required document types are on file."
            : "Your business is approved and live on the platform. You can upload documents below for your records — they were not required before this account was verified."}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {REQUIRED_KINDS.map((kind) => {
        const done = uploaded.has(kind);
        return (
          <li
            key={kind}
            className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${
              done
                ? "border-emerald-100 bg-emerald-50/80 text-emerald-950"
                : "border-border bg-background text-foreground"
            }`}
          >
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted mt-0.5" />
            )}
            <span>
              <span className="font-semibold">{kindLabel(kind)}</span>
              {done ? (
                <span className="block text-emerald-800/80 mt-0.5">Uploaded</span>
              ) : (
                <span className="block text-muted mt-0.5">Required — not uploaded yet</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
