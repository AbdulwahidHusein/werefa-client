"use client";

import { useActionState, useState } from "react";

import { joinQueueAction, type JoinState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";

const initial: JoinState = undefined;

export function JoinButton({
  serviceId,
  serviceName,
  isPrivate,
  joinable,
  autoJoin,
  inviteToken,
}: {
  serviceId: string;
  serviceName: string;
  isPrivate: boolean;
  joinable: boolean;
  autoJoin?: boolean;
  inviteToken?: string;
}) {
  const action = joinQueueAction.bind(null, serviceId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(autoJoin || false);

  if (!joinable) {
    return (
      <button
        type="button"
        disabled
        title="This business isn't accepting customers right now"
        className="h-10 shrink-0 cursor-not-allowed rounded-xl bg-zinc-100 px-4 text-sm font-medium text-muted"
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
        className="h-10 shrink-0 cursor-pointer rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-indigo-700"
      >
        Join
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Join the line">
        <form action={formAction} className="flex flex-col gap-4 pb-4">
          {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
          <p className="text-sm text-muted">
            Adding you to the line for{" "}
            <strong className="text-foreground">{serviceName}</strong>.
          </p>

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
            <details>
              <summary className="cursor-pointer text-xs text-muted">
                Have an access code?
              </summary>
              <div className="mt-2">
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

          {state?.error ? (
            <p className="text-sm text-danger" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? "Joining…" : "Confirm join"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
