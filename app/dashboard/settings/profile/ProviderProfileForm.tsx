"use client";

import { useActionState, useEffect, useState } from "react";
import { Info, Loader2, Save } from "lucide-react";
import { ProviderLogo } from "@/components/ProviderLogo";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/StatusPill";
import { BusinessLogoUpload } from "@/components/BusinessLogoUpload";
import { RegionCitySelect } from "@/components/RegionCitySelect";
import {
  updateProviderAction,
  uploadProviderProfileImageAction,
  type ProfileUpdateState,
} from "./actions";
import type { MyProvider } from "@/lib/dal";
import {
  formatCategoryLabel,
  PROVIDER_CATEGORIES,
} from "@/lib/provider-categories";

type ExtendedProvider = MyProvider & {
  last_rejection_reason?: string | null;
  profile_image_url?: string | null;
  category?: string | null;
  description?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  show_phone_public?: boolean;
  website?: string | null;
  biz_email?: string | null;
};

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
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
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
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

export function ProviderProfileForm({
  provider,
  readonly = false,
}: {
  provider: ExtendedProvider;
  readonly?: boolean;
}) {
  const action = updateProviderAction.bind(null, provider.id);
  const uploadAction = uploadProviderProfileImageAction.bind(
    null,
    provider.id,
    provider.slug,
  );
  const [state, formAction, pending] = useActionState<ProfileUpdateState, FormData>(
    action,
    undefined,
  );

  const [bizName, setBizName] = useState(provider.biz_name ?? "");
  const [category, setCategory] = useState(provider.category ?? "");
  const [description, setDescription] = useState(provider.description ?? "");
  const [region, setRegion] = useState(provider.region ?? "");
  const [city, setCity] = useState(provider.city ?? "");
  const [address, setAddress] = useState(provider.address ?? "");
  const [phone, setPhone] = useState(provider.phone ?? "");
  const [showPhonePublic, setShowPhonePublic] = useState(provider.show_phone_public ?? false);
  const [website, setWebsite] = useState(provider.website ?? "");
  const [bizEmail, setBizEmail] = useState(provider.biz_email ?? "");
  const [latitude, setLatitude] = useState(provider.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(provider.longitude?.toString() ?? "");
  const [joinRadius, setJoinRadius] = useState(provider.join_radius_m?.toString() ?? "");
  const [isOpen, setIsOpen] = useState(provider.is_open);
  const [localSuccess, setLocalSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setLocalSuccess(true);
      const t = setTimeout(() => setLocalSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [state]);

  function handleCancel() {
    setBizName(provider.biz_name ?? "");
    setCategory(provider.category ?? "");
    setDescription(provider.description ?? "");
    setRegion(provider.region ?? "");
    setCity(provider.city ?? "");
    setAddress(provider.address ?? "");
    setPhone(provider.phone ?? "");
    setShowPhonePublic(provider.show_phone_public ?? false);
    setWebsite(provider.website ?? "");
    setBizEmail(provider.biz_email ?? "");
    setLatitude(provider.latitude?.toString() ?? "");
    setLongitude(provider.longitude?.toString() ?? "");
    setJoinRadius(provider.join_radius_m?.toString() ?? "");
    setIsOpen(provider.is_open);
  }

  const hasChanges =
    bizName !== (provider.biz_name ?? "") ||
    category !== (provider.category ?? "") ||
    description !== (provider.description ?? "") ||
    region !== (provider.region ?? "") ||
    city !== (provider.city ?? "") ||
    address !== (provider.address ?? "") ||
    phone !== (provider.phone ?? "") ||
    showPhonePublic !== (provider.show_phone_public ?? false) ||
    website !== (provider.website ?? "") ||
    bizEmail !== (provider.biz_email ?? "") ||
    latitude !== (provider.latitude?.toString() ?? "") ||
    longitude !== (provider.longitude?.toString() ?? "") ||
    joinRadius !== (provider.join_radius_m?.toString() ?? "") ||
    isOpen !== provider.is_open;

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

  const isSaveDisabled = readonly || !hasChanges || !!validationError || pending;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Business logo ── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Business logo
        </h3>
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background">
          {readonly ? (
            <div className="flex justify-center p-8">
              <ProviderLogo
                name={provider.biz_name}
                imageUrl={provider.profile_image_url}
                size="xl"
                variant="upload"
              />
            </div>
          ) : (
            <BusinessLogoUpload
              businessName={provider.biz_name}
              imageUrl={provider.profile_image_url}
              uploadAction={uploadAction}
            />
          )}
        </div>
      </section>

      {/* ── Verification status ── */}
      <section className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Verification Status</span>
          <StatusPill status={provider.verification_status} />
        </div>
        <Link
          href="/dashboard/settings/documents"
          className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold text-accent hover:bg-zinc-50 transition-colors"
        >
          <span>Verification Documents</span>
          <span className="text-muted">→</span>
        </Link>
        {provider.verification_status === "pending" ? (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900 p-3 text-xs leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            Pending approval. Public search and queue access are locked until verified.
          </div>
        ) : null}
        {provider.verification_status === "rejected" ? (
          <div className="flex flex-col gap-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 p-3 text-xs">
            <p className="font-semibold">Rejection Reason</p>
            <p className="leading-relaxed">{provider.last_rejection_reason ?? "No details provided."}</p>
          </div>
        ) : null}
      </section>

      {/* ── Main editable form ── */}
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="is_open" value={String(isOpen)} />
        <input type="hidden" name="show_phone_public" value={String(showPhonePublic)} />

        {/* Success / error */}
        {localSuccess ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-950 p-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            Profile updated successfully.
          </div>
        ) : null}
        {state?.error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 text-rose-950 p-4 text-sm font-medium" role="alert">
            {state.error}
          </div>
        ) : null}

        {/* ── Identity ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Business Identity</h3>

          <Field
            label="Business Name"
            name="biz_name"
            value={bizName}
            onChange={(e) => setBizName(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g., Selam Dental Clinic"
            disabled={readonly}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={readonly}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a category…</option>
              {PROVIDER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {formatCategoryLabel(c)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              disabled={readonly}
              placeholder="Briefly describe your business, services, and what makes you unique…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted text-right">{description.length}/1000</p>
          </div>
        </section>

        {/* ── Contact & Location ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Contact &amp; Location</h3>

          <RegionCitySelect
            region={region}
            city={city}
            onRegionChange={setRegion}
            onCityChange={setCity}
            disabled={readonly}
            required
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            placeholder="+251 91 234 5678"
            disabled={readonly}
          />

          <Field
            label="Street Address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            placeholder="Bole Road, near Edna Mall"
            disabled={readonly}
          />

          <div className="rounded-xl border border-border bg-background px-4 py-1">
            <Toggle
              label="Show phone publicly"
              description="Display phone number on your public business page"
              checked={showPhonePublic}
              onChange={setShowPhonePublic}
              disabled={readonly}
            />
          </div>

          <Field
            label="Business Email"
            name="biz_email"
            type="email"
            value={bizEmail}
            onChange={(e) => setBizEmail(e.target.value)}
            maxLength={255}
            placeholder="info@mybusiness.com"
            disabled={readonly}
          />

          <Field
            label="Website"
            name="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            maxLength={200}
            placeholder="https://mybusiness.com"
            disabled={readonly}
          />
        </section>

        {/* ── GPS ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">GPS &amp; Geofencing</h3>
          <p className="text-xs text-muted -mt-2 leading-relaxed">
            Optional — enables proximity enforcement and map discovery.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Latitude"
              name="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="9.0307"
              disabled={readonly}
            />
            <Field
              label="Longitude"
              name="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="38.7406"
              disabled={readonly}
            />
          </div>

          <Field
            label="Join Radius (meters)"
            name="join_radius_m"
            type="number"
            min={1}
            value={joinRadius}
            onChange={(e) => setJoinRadius(e.target.value)}
            placeholder="Leave empty to disable geofencing"
            disabled={readonly}
          />
        </section>

        {/* ── Business Status ── */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Business Status</h3>
          <div className="rounded-xl border border-border bg-background px-4 py-1">
            <Toggle
              label="Open for business"
              description="Master switch — when off, all queue services stop accepting new tickets"
              checked={isOpen}
              onChange={setIsOpen}
              disabled={readonly}
            />
          </div>
          <p className="text-xs text-muted px-1">
            Per-service pausing and private access codes are managed from each service&apos;s settings.
          </p>
        </section>

        {validationError ? (
          <p className="text-sm text-danger font-medium" role="alert">
            {validationError}
          </p>
        ) : null}

        {!readonly ? (
          <div className="flex gap-3">
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
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="h-4 w-4" /> Save Profile</>
              )}
            </Button>
          </div>
        ) : null}

        {/* Danger zone */}
        {!readonly ? (
          <div className="mt-2 pt-6 border-t border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">Danger Zone</h4>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
              <p className="text-sm font-bold text-rose-950">Deactivate / Delete Business</p>
              <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                Business profiles are linked to verification contracts and queue history. To deactivate or permanently delete this profile, contact our administrators.
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
