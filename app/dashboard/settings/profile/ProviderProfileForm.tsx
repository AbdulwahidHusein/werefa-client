"use client";

import { useActionState, useEffect, useState } from "react";
import { Info, HelpCircle, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { updateProviderAction, type ProfileUpdateState } from "./actions";
import type { MyProvider } from "@/lib/dal";

export function ProviderProfileForm({ provider }: { provider: MyProvider }) {
  const action = updateProviderAction.bind(null, provider.id);
  const [state, formAction, pending] = useActionState(action, undefined);

  // Form State
  const [bizName, setBizName] = useState(provider.biz_name || "");
  const [latitude, setLatitude] = useState(provider.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(provider.longitude?.toString() || "");
  const [joinRadius, setJoinRadius] = useState(provider.join_radius_m?.toString() || "");
  const [isOpen, setIsOpen] = useState(provider.is_open);
  const [isPaused, setIsPaused] = useState(provider.is_paused);
  const [isPrivate, setIsPrivate] = useState(provider.is_private);

  const [localSuccess, setLocalSuccess] = useState(false);

  // Watch for successful action update
  useEffect(() => {
    if (state?.success) {
      setLocalSuccess(true);
      const timer = setTimeout(() => setLocalSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Rollback function
  function handleCancel() {
    setBizName(provider.biz_name || "");
    setLatitude(provider.latitude?.toString() || "");
    setLongitude(provider.longitude?.toString() || "");
    setJoinRadius(provider.join_radius_m?.toString() || "");
    setIsOpen(provider.is_open);
    setIsPaused(provider.is_paused);
    setIsPrivate(provider.is_private);
  }

  // Check if any fields changed
  const hasChanges =
    bizName !== (provider.biz_name || "") ||
    latitude !== (provider.latitude?.toString() || "") ||
    longitude !== (provider.longitude?.toString() || "") ||
    joinRadius !== (provider.join_radius_m?.toString() || "") ||
    isOpen !== provider.is_open ||
    isPaused !== provider.is_paused ||
    isPrivate !== provider.is_private;

  // Real-time Validation Check
  let validationError = "";
  if (bizName.trim().length < 2) {
    validationError = "Business name must be at least 2 characters.";
  } else if ((latitude.trim() !== "") !== (longitude.trim() !== "")) {
    validationError = "Set both latitude and longitude, or leave both empty.";
  } else if (latitude.trim() !== "" && isNaN(Number(latitude))) {
    validationError = "Latitude must be a valid number.";
  } else if (longitude.trim() !== "" && isNaN(Number(longitude))) {
    validationError = "Longitude must be a valid number.";
  } else if (joinRadius.trim() !== "" && (isNaN(Number(joinRadius)) || Number(joinRadius) < 1)) {
    validationError = "Join radius must be a positive number.";
  }

  const isSaveDisabled = !hasChanges || !!validationError || pending;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Hidden toggles inside the form to capture switch states */}
      <input type="hidden" name="is_open" value={String(isOpen)} />
      <input type="hidden" name="is_paused" value={String(isPaused)} />
      <input type="hidden" name="is_private" value={String(isPrivate)} />

      {/* Verification status and notes */}
      <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Verification Status</span>
          <StatusPill status={provider.verification_status} />
        </div>

        <Link
          href="/dashboard/settings/documents"
          className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold text-accent hover:bg-zinc-50 transition-colors animate-in fade-in"
        >
          <span>View Verification Documents</span>
          <span className="text-muted">→</span>
        </Link>

        {provider.verification_status === "pending" ? (
          <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-100 text-amber-900 rounded-xl p-3 text-xs leading-normal">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              Your business is pending approval. Public search is locked. You can still set up services and manage members locally.
            </p>
          </div>
        ) : null}

        {provider.verification_status === "rejected" ? (
          <div className="flex flex-col gap-1.5 bg-rose-50 border border-rose-100 text-rose-900 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-rose-950">
              <Info className="h-4 w-4 shrink-0 text-rose-600" />
              Rejection Reason
            </div>
            <p className="leading-normal">
              {provider.last_rejection_reason || "No details provided by administration."}
            </p>
          </div>
        ) : null}
      </div>

      {localSuccess ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-950 p-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          Business settings updated successfully!
        </div>
      ) : null}

      {state?.error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 text-rose-950 p-4 text-sm font-medium animate-in fade-in duration-200" role="alert">
          {state.error}
        </div>
      ) : null}

      {/* Core Profile Fields */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Business Details</h3>
        
        <Field
          label="Business Name"
          name="biz_name"
          type="text"
          value={bizName}
          onChange={(e) => setBizName(e.target.value)}
          required
          maxLength={100}
          placeholder="e.g., Upwork Premium Services"
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Latitude"
            name="latitude"
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g., 9.030"
          />
          <Field
            label="Longitude"
            name="longitude"
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g., 38.740"
          />
        </div>

        <Field
          label="Join Radius (meters)"
          name="join_radius_m"
          type="number"
          min="1"
          value={joinRadius}
          onChange={(e) => setJoinRadius(e.target.value)}
          placeholder="e.g., 500 (optional)"
        />
      </section>

      {/* Queue Configurations toggles */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Queue Configuration</h3>

        {/* Toggle 1: Open for Business */}
        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">Open for Business</span>
            <span className="text-xs text-muted">Control whether queue entries can be accepted</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isOpen ? "bg-accent" : "bg-zinc-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isOpen ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Pause remote joins */}
        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">Pause Remote Join</span>
            <span className="text-xs text-muted">Bypass online registration while keeping walk-ins open</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isPaused ? "bg-accent" : "bg-zinc-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPaused ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Private line */}
        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">Private Queue Line</span>
            <span className="text-xs text-muted">Require customers to enter access code to join line</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isPrivate ? "bg-accent" : "bg-zinc-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPrivate ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      {validationError ? (
        <p className="text-sm text-danger font-medium animate-in fade-in" role="alert">
          {validationError}
        </p>
      ) : null}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={!hasChanges || pending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaveDisabled}
          className="flex-1 flex gap-2 items-center justify-center"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="mt-8 pt-6 border-t border-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">Danger Zone</h4>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex flex-col gap-2">
          <h5 className="text-sm font-bold text-rose-950">Deactivate / Delete Business</h5>
          <p className="text-xs text-rose-800 leading-normal">
            Business profiles hold verification contracts and public queue records. Direct deletion is disabled. If you want to deactivate or permanently delete this profile, please contact our system administrators.
          </p>
        </div>
      </div>
    </form>
  );
}
