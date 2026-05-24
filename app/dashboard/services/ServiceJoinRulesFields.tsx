"use client";

import { FileUp, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  JOIN_DOCUMENT_KIND_OPTIONS,
  parseRequirements,
  type JoinDocumentKind,
  type JoinDocumentRequirement,
} from "@/lib/join-documents";

const MAX_SLOTS = 8;

export function ServiceJoinRulesFields({
  initialRequiresApproval = false,
  initialApprovalQueueOrder = "preserve_register_time",
  initialRequiresDocuments = false,
  initialDocumentRequirements,
}: {
  initialRequiresApproval?: boolean;
  initialApprovalQueueOrder?: "preserve_register_time" | "approval_time";
  initialRequiresDocuments?: boolean;
  initialDocumentRequirements?: unknown;
}) {
  const parsedInitial = parseRequirements(initialDocumentRequirements);
  const [requiresApproval, setRequiresApproval] = useState(initialRequiresApproval);
  const [queueOrder, setQueueOrder] = useState(initialApprovalQueueOrder);
  const [requiresDocuments, setRequiresDocuments] = useState(initialRequiresDocuments);
  const [slots, setSlots] = useState<JoinDocumentRequirement[]>(
    parsedInitial.length > 0 ? parsedInitial : [{ label: "", kind: "any" }],
  );

  const requirementsJson = requiresDocuments
    ? JSON.stringify(
        slots
          .map((s) => ({ label: s.label.trim(), kind: s.kind }))
          .filter((s) => s.label.length > 0),
      )
    : "[]";

  function updateSlot(index: number, patch: Partial<JoinDocumentRequirement>) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, { label: "", kind: "any" }]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ label: "", kind: "any" }];
    });
  }

  return (
    <>
      <input type="hidden" name="requires_join_approval" value={String(requiresApproval)} />
      <input type="hidden" name="requires_join_documents" value={String(requiresDocuments)} />
      <input type="hidden" name="approval_queue_order" value={queueOrder} />
      <input type="hidden" name="join_document_requirements" value={requirementsJson} />

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Join approval
        </h3>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
            <span>
              <span className="text-sm font-medium">Require approval before joining</span>
              <span className="mt-0.5 block text-xs text-muted leading-relaxed">
                App customers request to join; you approve before they enter the line.
                Walk-ins you add still go straight in.
              </span>
            </span>
          </label>

          {requiresApproval ? (
            <div className="mt-4 border-t border-border/60 pt-4">
              <p className="text-xs font-semibold text-muted">Queue position when approved</p>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                  <input
                    type="radio"
                    name="approval_queue_order_ui"
                    checked={queueOrder === "preserve_register_time"}
                    onChange={() => setQueueOrder("preserve_register_time")}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Original request time</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      Keeps their place from when they asked
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                  <input
                    type="radio"
                    name="approval_queue_order_ui"
                    checked={queueOrder === "approval_time"}
                    onChange={() => setQueueOrder("approval_time")}
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
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <FileUp className="h-3.5 w-3.5 text-accent" />
          Documents from joiners
        </h3>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={requiresDocuments}
              onChange={(e) => setRequiresDocuments(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
            <span>
              <span className="text-sm font-medium">Ask joiners to upload documents</span>
              <span className="mt-0.5 block text-xs text-muted leading-relaxed">
                Customers must attach files in the app before joining this line.
              </span>
            </span>
          </label>

          {requiresDocuments ? (
            <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
              <p className="text-xs font-semibold text-muted">
                Required uploads ({slots.length} of {MAX_SLOTS} max)
              </p>
              <ul className="space-y-3">
                {slots.map((slot, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-border bg-surface/40 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1">
                        <label className="text-xs font-semibold text-muted">
                          What should they upload?
                        </label>
                        <input
                          type="text"
                          value={slot.label}
                          onChange={(e) => updateSlot(index, { label: e.target.value })}
                          placeholder='e.g. "National ID" or "Referral letter"'
                          maxLength={120}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="sm:w-44">
                        <label className="text-xs font-semibold text-muted">File type</label>
                        <select
                          value={slot.kind}
                          onChange={(e) =>
                            updateSlot(index, {
                              kind: e.target.value as JoinDocumentKind,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          {JOIN_DOCUMENT_KIND_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        disabled={slots.length <= 1}
                        onClick={() => removeSlot(index)}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-border px-3 text-muted hover:bg-surface disabled:opacity-40"
                        aria-label="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={slots.length >= MAX_SLOTS}
                onClick={addSlot}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add another document
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
