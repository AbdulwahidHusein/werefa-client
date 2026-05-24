"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";

import { updateQueueApprovalSettingsAction } from "./actions";
import { isQueueActionOk, queueActionError } from "./queue-action-utils";

export function QueueApprovalSettings({
  providerId,
  serviceId,
  requiresJoinApproval,
  approvalQueueOrder,
  onActionDone,
}: {
  providerId: string;
  serviceId: string;
  requiresJoinApproval: boolean;
  approvalQueueOrder: "preserve_register_time" | "approval_time";
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [requiresApproval, setRequiresApproval] = useState(requiresJoinApproval);
  const [queueOrder, setQueueOrder] = useState(approvalQueueOrder);
  const [pending, startTransition] = useTransition();

  function save(next: {
    requiresJoinApproval?: boolean;
    approvalQueueOrder?: typeof queueOrder;
  }) {
    const body = {
      requires_join_approval: next.requiresJoinApproval ?? requiresApproval,
      approval_queue_order: next.approvalQueueOrder ?? queueOrder,
    };
    startTransition(async () => {
      const res = await updateQueueApprovalSettingsAction(
        providerId,
        serviceId,
        body,
      );
      if (isQueueActionOk(res)) {
        onActionDone?.(res.message ?? "Queue settings saved.");
      } else {
        onActionDone?.(queueActionError(res, "Could not save."), "err");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-accent" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Join approval</h3>
          <p className="mt-0.5 text-xs text-muted">
            When on, app customers request to join — you approve them before they appear in
            the line. Walk-ins you add still go straight in. Without approval, customers join
            directly (access code or invite still applies if set).
          </p>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={requiresApproval}
          disabled={pending}
          onChange={(e) => {
            const v = e.target.checked;
            setRequiresApproval(v);
            save({ requiresJoinApproval: v });
          }}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-sm font-medium">Require approval before joining</span>
      </label>

      {requiresApproval ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-muted">Queue position when approved</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 cursor-pointer items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
              <input
                type="radio"
                name="approval_queue_order"
                checked={queueOrder === "preserve_register_time"}
                disabled={pending}
                onChange={() => {
                  setQueueOrder("preserve_register_time");
                  save({ approvalQueueOrder: "preserve_register_time" });
                }}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Original request time</span>
                <span className="mt-0.5 block text-xs text-muted">
                  Keeps their place as if they joined when they asked
                </span>
              </span>
            </label>
            <label className="flex flex-1 cursor-pointer items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
              <input
                type="radio"
                name="approval_queue_order"
                checked={queueOrder === "approval_time"}
                disabled={pending}
                onChange={() => {
                  setQueueOrder("approval_time");
                  save({ approvalQueueOrder: "approval_time" });
                }}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Approval time</span>
                <span className="mt-0.5 block text-xs text-muted">
                  They go to the back when you approve
                </span>
              </span>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
