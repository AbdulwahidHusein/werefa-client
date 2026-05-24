"use client";

import { FileUp, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { updateJoinDocumentSettingsAction } from "./actions";
import {
  JOIN_DOCUMENT_KIND_OPTIONS,
  type JoinDocumentKind,
  type JoinDocumentRequirement,
} from "@/lib/join-documents";
import { isQueueActionOk, queueActionError } from "./queue-action-utils";

const MAX_SLOTS = 8;

export function JoinDocumentSettings({
  providerId,
  serviceId,
  initialRequires,
  initialRequirements,
  onActionDone,
}: {
  providerId: string;
  serviceId: string;
  initialRequires: boolean;
  initialRequirements: JoinDocumentRequirement[];
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [enabled, setEnabled] = useState(initialRequires);
  const [slots, setSlots] = useState<JoinDocumentRequirement[]>(
    initialRequirements.length > 0
      ? initialRequirements
      : [{ label: "", kind: "any" }],
  );
  const [pending, startTransition] = useTransition();

  function save(
    nextEnabled: boolean,
    nextSlots: JoinDocumentRequirement[],
  ) {
    const requirements = nextEnabled
      ? nextSlots
          .map((s) => ({
            label: s.label.trim(),
            kind: s.kind,
          }))
          .filter((s) => s.label.length > 0)
      : [];

    if (nextEnabled && requirements.length === 0) {
      onActionDone?.("Add at least one document with a short description.", "err");
      return;
    }

    startTransition(async () => {
      const res = await updateJoinDocumentSettingsAction(providerId, serviceId, {
        requires_join_documents: nextEnabled,
        join_document_requirements: nextEnabled ? requirements : [],
      });
      if (isQueueActionOk(res)) {
        onActionDone?.(res.message ?? "Document settings saved.");
      } else {
        onActionDone?.(queueActionError(res, "Could not save."), "err");
      }
    });
  }

  function toggleEnabled(v: boolean) {
    setEnabled(v);
    save(v, slots);
  }

  function updateSlot(
    index: number,
    patch: Partial<JoinDocumentRequirement>,
  ) {
    const next = slots.map((s, i) => (i === index ? { ...s, ...patch } : s));
    setSlots(next);
  }

  function addSlot() {
    if (slots.length >= MAX_SLOTS) return;
    setSlots([...slots, { label: "", kind: "any" }]);
  }

  function removeSlot(index: number) {
    const next = slots.filter((_, i) => i !== index);
    setSlots(next.length ? next : [{ label: "", kind: "any" }]);
    if (enabled) save(true, next.length ? next : [{ label: "", kind: "any" }]);
  }

  function saveSlots() {
    save(enabled, slots);
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start gap-2">
        <FileUp className="mt-0.5 h-4 w-4 text-accent" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Documents from joiners</h2>
          <p className="mt-1 text-sm text-muted">
            When enabled, customers must upload files before they can join from the
            app. Describe each document in plain language (e.g. &quot;National ID&quot;)
            and choose whether you want a photo, PDF, or either.
          </p>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={pending}
          onChange={(e) => toggleEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-sm font-medium">Ask joiners to upload documents</span>
      </label>

      {enabled ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-muted">
            Required uploads ({slots.length} of {MAX_SLOTS} max)
          </p>
          <ul className="space-y-3">
            {slots.map((slot, index) => (
              <li
                key={index}
                className="rounded-xl border border-border bg-surface/50 p-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label className="text-xs font-semibold text-muted">
                      What should they upload?
                    </label>
                    <input
                      type="text"
                      value={slot.label}
                      disabled={pending}
                      onChange={(e) => updateSlot(index, { label: e.target.value })}
                      onBlur={saveSlots}
                      placeholder='e.g. "Insurance card" or "Referral letter"'
                      maxLength={120}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:w-48">
                    <label className="text-xs font-semibold text-muted">File type</label>
                    <select
                      value={slot.kind}
                      disabled={pending}
                      onChange={(e) => {
                        updateSlot(index, {
                          kind: e.target.value as JoinDocumentKind,
                        });
                        save(enabled, slots.map((s, i) =>
                          i === index
                            ? { ...s, kind: e.target.value as JoinDocumentKind }
                            : s,
                        ));
                      }}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      {JOIN_DOCUMENT_KIND_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label} — {o.hint}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={pending || slots.length <= 1}
                    onClick={() => removeSlot(index)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm text-muted hover:bg-surface disabled:opacity-40"
                    aria-label="Remove document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending || slots.length >= MAX_SLOTS}
              onClick={addSlot}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add another document
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={saveSlots}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
            >
              Save document rules
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
