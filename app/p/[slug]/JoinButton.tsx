"use client";

import { Crown } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";

import { joinQueueAction, type JoinState } from "./actions";
import { JoinErrorAlert } from "@/components/JoinErrorAlert";
import { ServiceLinePreviewCard } from "@/components/ServiceLinePreviewCard";
import { JoinDocumentUploadFields } from "@/components/JoinDocumentUploadFields";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { readCachedLocation } from "@/lib/geo";
import type { JoinDocumentRequirement } from "@/lib/join-documents";

const initial: JoinState = undefined;

export function JoinButton({
  serviceId,
  serviceName,
  isPrivate,
  allowVip,
  joinable,
  autoJoin,
  inviteToken,
  joinDocuments = [],
}: {
  serviceId: string;
  serviceName: string;
  isPrivate: boolean;
  allowVip?: boolean;
  joinable: boolean;
  autoJoin?: boolean;
  inviteToken?: string;
  joinDocuments?: JoinDocumentRequirement[];
}) {
  const formId = useId();
  const action = joinQueueAction.bind(null, serviceId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(autoJoin || false);
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [useVip, setUseVip] = useState(false);

  useEffect(() => {
    const cached = readCachedLocation();
    if (cached) {
      setCoords({ lat: String(cached.lat), lng: String(cached.lng) });
    }
  }, [open]);

  if (!joinable) {
    return (
      <button
        type="button"
        disabled
        title="This business isn't accepting customers right now"
        className="h-11 shrink-0 cursor-not-allowed rounded-lg bg-surface px-4 text-sm font-medium text-muted"
      >
        Join
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 shrink-0 cursor-pointer rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
      >
        Join
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Join the line"
        footer={
          <Button
            type="submit"
            form={formId}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Joining…" : "Confirm join"}
          </Button>
        }
      >
        <form
          id={formId}
          action={formAction}
          className="flex flex-col gap-4 pb-4"
        >
          {inviteToken ? (
            <input type="hidden" name="invite_token" value={inviteToken} />
          ) : null}
          {coords ? (
            <>
              <input type="hidden" name="latitude" value={coords.lat} />
              <input type="hidden" name="longitude" value={coords.lng} />
            </>
          ) : null}
          <p className="text-sm text-muted">
            Adding you to the line for{" "}
            <strong className="text-foreground">{serviceName}</strong>.
          </p>

          <ServiceLinePreviewCard serviceItemId={serviceId} enabled={open} />

          {isPrivate ? (
            <Field
              label="Access code"
              name="access_code"
              required
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              defaultValue={state?.code ?? ""}
              placeholder="ABCDEF"
            />
          ) : (
            <details className="rounded-xl border border-border bg-surface/30 px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Have an access code?
              </summary>
              <div className="mt-3 pb-1">
                <Field
                  label="Access code"
                  name="access_code"
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  defaultValue={state?.code ?? ""}
                  placeholder="Optional"
                />
              </div>
            </details>
          )}

          {joinDocuments.length > 0 ? (
            <>
              <input
                type="hidden"
                name="join_doc_count"
                value={String(joinDocuments.length)}
              />
              <JoinDocumentUploadFields requirements={joinDocuments} />
            </>
          ) : null}

          {allowVip ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
              <button
                type="button"
                onClick={() => setUseVip((v) => !v)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-1.5 font-medium text-amber-800">
                  <Crown className="h-4 w-4 text-amber-500" />
                  I have a VIP code
                </span>
                <span className="text-xs text-amber-600">
                  {useVip ? "▲ hide" : "▼ enter code"}
                </span>
              </button>
              {useVip ? (
                <div className="mt-2">
                  <Field
                    label="VIP code"
                    name="vip_code"
                    maxLength={20}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="e.g., GOLD2024"
                  />
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    VIP customers are served before the regular queue.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {state?.error ? <JoinErrorAlert message={state.error} /> : null}
        </form>
      </Sheet>
    </>
  );
}
