"use client";

import { useActionState, useEffect, useState } from "react";

import { setupBusinessAction, type SetupState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import {
  formatCategoryLabel,
  PROVIDER_CATEGORIES,
} from "@/lib/provider-categories";
import {
  cacheLocation,
  readCachedLocation,
  requestLocation,
} from "@/lib/geo";

const initial: SetupState = undefined;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 lg:p-6">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupBusinessAction, initial);
  const f = state?.fields;

  const [bizName, setBizName] = useState(f?.biz_name ?? "");
  const [slug, setSlug] = useState(f?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(f?.slug));
  const [category, setCategory] = useState(f?.category ?? "");
  const [description, setDescription] = useState(f?.description ?? "");
  const [city, setCity] = useState(f?.city ?? "");
  const [address, setAddress] = useState(f?.address ?? "");
  const [phone, setPhone] = useState(f?.phone ?? "");
  const [showPhonePublic, setShowPhonePublic] = useState(
    f?.show_phone_public === "true",
  );
  const [bizEmail, setBizEmail] = useState(f?.biz_email ?? "");
  const [website, setWebsite] = useState(f?.website ?? "");
  const [accessCode, setAccessCode] = useState(f?.access_code ?? "");
  const [isPrivate, setIsPrivate] = useState(f?.is_private === "true");
  const [latitude, setLatitude] = useState(f?.latitude ?? "");
  const [longitude, setLongitude] = useState(f?.longitude ?? "");
  const [joinRadius, setJoinRadius] = useState(f?.join_radius_m ?? "200");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    if (latitude || longitude) return;
    const cached = readCachedLocation();
    if (cached) {
      setLatitude(String(cached.lat));
      setLongitude(String(cached.lng));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(bizName));
  }, [bizName, slugTouched]);

  async function useDevice() {
    setLocating(true);
    setLocError(null);
    try {
      const c = await requestLocation();
      cacheLocation(c);
      setLatitude(String(c.lat));
      setLongitude(String(c.lng));
    } catch (e) {
      setLocError(e instanceof Error ? e.message : "Could not get location");
    } finally {
      setLocating(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="show_phone_public" value={String(showPhonePublic)} />
      <input type="hidden" name="is_private" value={String(isPrivate)} />

      <Section
        title="Identity"
        description="How customers will recognize you on Werefa and in search."
      >
        <Field
          label="Business name"
          name="biz_name"
          required
          autoComplete="organization"
          value={bizName}
          onChange={(e) => setBizName(e.target.value)}
          placeholder="Selam Dental Clinic"
          maxLength={200}
        />
        <Field
          label="Public URL slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase());
          }}
          placeholder="selam-dental"
        />
        <p className="-mt-2 text-xs text-muted">
          Your page: werefa.app/p/
          <span className="font-medium text-foreground">{slug || "your-slug"}</span>
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Category
          </label>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
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
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Description
            <span className="ml-1 text-xs font-normal text-muted">(optional)</span>
          </label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="What you offer, hours, languages spoken, parking, etc."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <p className="mt-1 text-right text-xs text-muted">
            {description.length}/1000
          </p>
        </div>
      </Section>

      <Section
        title="Contact & address"
        description="Shown on your public business page when customers browse or join."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="City"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Addis Ababa"
            maxLength={100}
            autoComplete="address-level2"
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 91 234 5678"
            maxLength={20}
            autoComplete="tel"
          />
        </div>
        <Field
          label="Street address"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Bole Road, near Edna Mall"
          maxLength={500}
          autoComplete="street-address"
        />
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background px-3 py-3">
          <input
            type="checkbox"
            checked={showPhonePublic}
            onChange={(e) => setShowPhonePublic(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
          />
          <span className="text-sm">
            <span className="font-medium">Show phone on public page</span>
            <span className="mt-0.5 block text-xs text-muted">
              Otherwise only staff see it in the dashboard.
            </span>
          </span>
        </label>
        <Field
          label="Business email"
          name="biz_email"
          type="email"
          value={bizEmail}
          onChange={(e) => setBizEmail(e.target.value)}
          placeholder="frontdesk@mybusiness.com"
          maxLength={255}
          autoComplete="email"
        />
        <Field
          label="Website"
          name="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://mybusiness.com"
          maxLength={200}
        />
      </Section>

      <Section
        title="Location & discovery"
        description="GPS powers the map and how close someone must be to join your queue."
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Use your device GPS or enter coordinates manually.
          </p>
          <button
            type="button"
            onClick={useDevice}
            disabled={locating}
            className="shrink-0 cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locating ? "Locating…" : "Use my location"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="8.98"
          />
          <Field
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="38.76"
          />
        </div>
        {locError ? (
          <p className="text-xs text-danger" role="alert">
            {locError}
          </p>
        ) : null}
        <Field
          label="Join radius (meters)"
          name="join_radius_m"
          type="number"
          min={1}
          step={1}
          value={joinRadius}
          onChange={(e) => setJoinRadius(e.target.value)}
          placeholder="200"
        />
        <p className="-mt-2 text-xs text-muted">
          Customers must be within this distance to join remotely (typical: 100–500 m).
        </p>
      </Section>

      <Section
        title="Queue access"
        description="Optional controls for invite-only or code-based joining."
      >
        <Field
          label="Access code"
          name="access_code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
          placeholder="BOLE01"
          maxLength={6}
        />
        <p className="-mt-2 text-xs text-muted">
          4–6 letters/numbers for VIP or staff-assisted joins. Leave blank for open queues.
        </p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background px-3 py-3">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
          />
          <span className="text-sm">
            <span className="font-medium">Private listing</span>
            <span className="mt-0.5 block text-xs text-muted">
              Hide from public Discover; customers need a direct link or code.
            </span>
          </span>
        </label>
      </Section>

      <p className="text-xs text-muted">
        After creation you can upload a logo, add services, and submit for verification
        from Settings.
      </p>

      {state?.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Creating business…" : "Create business"}
      </Button>
    </form>
  );
}
