"use client";

import { useActionState, useState } from "react";
import { Crown } from "lucide-react";

import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
  type ServiceFormState,
} from "./actions";
import { ServiceJoinRulesFields } from "./ServiceJoinRulesFields";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { components } from "@/lib/api/schema";

type Service = components["schemas"]["ServiceItemPublic"] & {
  description?: string | null;
  requirements?: string | null;
  category?: string | null;
  is_paused?: boolean;
  is_private?: boolean;
  allow_vip?: boolean;
  vip_code?: string | null;
  requires_join_approval?: boolean;
  approval_queue_order?: "preserve_register_time" | "approval_time";
  requires_join_documents?: boolean;
  join_document_requirements?: unknown;
};

const SERVICE_CATEGORIES = [
  "consultation", "procedure", "checkup", "haircut", "shave",
  "manicure", "pedicure", "massage", "laboratory", "pharmacy",
  "account opening", "loan application", "deposit", "withdrawal",
  "registration", "exam", "counseling", "repair", "other",
];

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? "bg-accent" : "bg-zinc-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const initial: ServiceFormState = undefined;

export function ServiceForm({ service }: { service?: Service }) {
  const action = service
    ? updateServiceAction.bind(null, service.id)
    : createServiceAction;

  const [state, formAction, pending] = useActionState(action, initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Controlled state for toggles
  const [isActive, setIsActive] = useState(
    state?.fields?.is_active ?? (service ? service.is_active : true),
  );
  const [isPaused, setIsPaused] = useState(service?.is_paused ?? false);
  const [isPrivate, setIsPrivate] = useState(service?.is_private ?? false);
  const [allowVip, setAllowVip] = useState(service?.allow_vip ?? false);

  async function handleDelete() {
    if (!service) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteServiceAction(service.id);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed.");
      setDeleting(false);
    }
  }

  const defaults = {
    name: state?.fields?.name ?? service?.name ?? "",
    avg_duration_minutes:
      state?.fields?.avg_duration_minutes ??
      (service ? String(service.avg_duration_minutes) : "15"),
    price: state?.fields?.price ?? service?.price ?? "0",
    description: service?.description ?? "",
    requirements: service?.requirements ?? "",
    category: service?.category ?? "",
    vip_code: service?.vip_code ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-6">
        {/* Hidden toggle values */}
        <input type="hidden" name="is_active" value={String(isActive)} />
        <input type="hidden" name="is_paused" value={String(isPaused)} />
        <input type="hidden" name="is_private" value={String(isPrivate)} />
        <input type="hidden" name="allow_vip" value={String(allowVip)} />

        {/* ── Service Info ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Service Info</h3>

          <Field
            label="Service Name"
            name="name"
            required
            maxLength={120}
            defaultValue={defaults.name}
            placeholder="e.g., General Consultation, Haircut, Account Opening"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select
              name="category"
              defaultValue={defaults.category}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Select a category…</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
              <span className="ml-1 text-xs font-normal text-muted">(optional)</span>
            </label>
            <textarea
              name="description"
              defaultValue={defaults.description}
              maxLength={1000}
              rows={3}
              placeholder="What does this service involve? Who is it for?"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Requirements
              <span className="ml-1 text-xs font-normal text-muted">(optional)</span>
            </label>
            <textarea
              name="requirements"
              defaultValue={defaults.requirements}
              maxLength={500}
              rows={2}
              placeholder="What should customers bring? (National ID, referral letter, lab results…)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted"
            />
          </div>
        </section>

        {/* ── Pricing & Timing ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Pricing &amp; Timing</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Avg. Duration (min)"
              name="avg_duration_minutes"
              type="number"
              min={1}
              max={1440}
              step={1}
              required
              defaultValue={defaults.avg_duration_minutes}
            />
            <Field
              label="Price (ETB)"
              name="price"
              inputMode="decimal"
              required
              defaultValue={defaults.price}
              placeholder="0"
            />
          </div>
        </section>

        {/* ── Queue Controls ── */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Queue Controls</h3>
          <div className="rounded-xl border border-border bg-background px-4 py-1">
            <Toggle
              label="Active"
              description="Customers can see and join this service line"
              checked={isActive}
              onChange={setIsActive}
            />
            <Toggle
              label="Pause remote joins"
              description="Block online joins — walk-ins at the kiosk still work"
              checked={isPaused}
              onChange={setIsPaused}
            />
            <Toggle
              label="Private (access code)"
              description="Customers must enter the business access code to join"
              checked={isPrivate}
              onChange={setIsPrivate}
            />
          </div>
        </section>

        {/* ── VIP Settings ── */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            VIP Priority
          </h3>
          <div className="rounded-xl border border-border bg-background px-4 py-1">
            <Toggle
              label="Enable VIP queue"
              description="Customers with the VIP code jump ahead of regular queue"
              checked={allowVip}
              onChange={setAllowVip}
            />
          </div>
          {allowVip ? (
            <div>
              <Field
                label="VIP Code"
                name="vip_code"
                defaultValue={defaults.vip_code}
                maxLength={20}
                placeholder="e.g., GOLD2024, PREMIUM, VIP"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Share this code privately with VIP customers — via phone, card, or invitation. Anyone with the code gets served before regular queue members.
              </p>
            </div>
          ) : null}
        </section>

        <ServiceJoinRulesFields
          initialRequiresApproval={service?.requires_join_approval ?? false}
          initialApprovalQueueOrder={
            service?.approval_queue_order ?? "preserve_register_time"
          }
          initialRequiresDocuments={service?.requires_join_documents ?? false}
          initialDocumentRequirements={service?.join_document_requirements}
        />

        {state?.error ? (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending
            ? service ? "Saving…" : "Creating…"
            : service ? "Save changes" : "Add service"}
        </Button>
      </form>

      {/* Danger zone */}
      {service ? (
        <section className="rounded-2xl border border-border p-4">
          <h2 className="text-sm font-semibold text-rose-700">Danger zone</h2>
          <p className="mt-1 text-sm text-muted">
            Permanently remove this service line. Active tickets may block deletion.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-3 text-sm font-medium text-danger hover:underline"
            >
              Delete service
            </button>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm text-muted">This cannot be undone.</p>
              {deleteError ? <p className="text-sm text-danger">{deleteError}</p> : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="danger"
                  className="!w-auto flex-1"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="!w-auto flex-1"
                  disabled={deleting}
                  onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
