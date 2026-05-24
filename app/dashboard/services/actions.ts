"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import { getMyProvider } from "@/lib/dal";

type ServiceItemPublic = components["schemas"]["ServiceItemPublic"];

export type ServiceFormState =
  | {
      error?: string;
      fields?: {
        name?: string;
        avg_duration_minutes?: string;
        price?: string;
        is_active?: boolean;
        description?: string;
        requirements?: string;
        category?: string;
        is_paused?: boolean;
        is_private?: boolean;
      };
    }
  | undefined;

const PRICE_RE = /^(?!^[-+.]*$)0*\d*\.?\d*$/;

function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const durationRaw = String(formData.get("avg_duration_minutes") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  // Toggles come in as hidden inputs with "true"/"false"
  const is_active = formData.get("is_active") === "true";
  const is_paused = formData.get("is_paused") === "true";
  const is_private = formData.get("is_private") === "true";
  const allow_vip = formData.get("allow_vip") === "true";
  const vip_code = String(formData.get("vip_code") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const requirements = String(formData.get("requirements") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const requires_join_approval = formData.get("requires_join_approval") === "true";
  const requires_join_documents = formData.get("requires_join_documents") === "true";
  const approval_queue_order =
    String(formData.get("approval_queue_order") ?? "preserve_register_time").trim() ||
    "preserve_register_time";
  let join_document_requirements: { label: string; kind: string }[] = [];
  const reqsRaw = String(formData.get("join_document_requirements") ?? "[]");
  try {
    const parsed = JSON.parse(reqsRaw) as unknown;
    if (Array.isArray(parsed)) {
      join_document_requirements = parsed
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const o = item as Record<string, unknown>;
          const label = String(o.label ?? "").trim();
          const kind = String(o.kind ?? "any");
          if (!label) return null;
          return { label, kind };
        })
        .filter((x): x is { label: string; kind: string } => x !== null);
    }
  } catch {
    /* validated below */
  }
  return {
    name, durationRaw, price, is_active, is_paused, is_private,
    allow_vip, vip_code,
    description, requirements, category,
    requires_join_approval,
    requires_join_documents,
    approval_queue_order,
    join_document_requirements,
    fields: { name, avg_duration_minutes: durationRaw, price, is_active, is_paused, is_private },
  };
}

function validate(parsed: ReturnType<typeof parseFields>): string | null {
  const { name, durationRaw, price } = parsed;
  if (name.length < 1 || name.length > 120) return "Name is required (1–120 characters).";
  const duration = Number(durationRaw);
  if (!Number.isInteger(duration) || duration < 1 || duration > 1440)
    return "Duration must be a whole number between 1 and 1440 minutes.";
  if (!PRICE_RE.test(price)) return "Price must be a non-negative number (e.g. 0, 5, 5.50).";
  if (
    parsed.requires_join_documents &&
    parsed.join_document_requirements.length === 0
  ) {
    return "Add at least one document with a description, or turn off document uploads.";
  }
  if (
    parsed.approval_queue_order !== "preserve_register_time" &&
    parsed.approval_queue_order !== "approval_time"
  ) {
    return "Invalid approval queue order.";
  }
  return null;
}

function buildBody(parsed: ReturnType<typeof parseFields>) {
  return {
    name: parsed.name,
    avg_duration_minutes: Number(parsed.durationRaw),
    price: parsed.price,
    is_active: parsed.is_active,
    is_paused: parsed.is_paused,
    is_private: parsed.is_private,
    allow_vip: parsed.allow_vip,
    vip_code: parsed.vip_code,
    description: parsed.description,
    requirements: parsed.requirements,
    category: parsed.category,
    requires_join_approval: parsed.requires_join_approval,
    approval_queue_order: parsed.approval_queue_order,
    requires_join_documents: parsed.requires_join_documents,
    join_document_requirements: parsed.requires_join_documents
      ? parsed.join_document_requirements
      : [],
  };
}

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard");

  const parsed = parseFields(formData);
  const err = validate(parsed);
  if (err) return { error: err, fields: parsed.fields };

  try {
    await apiFetch<ServiceItemPublic>(`/providers/${provider.id}/services/`, {
      method: "POST",
      body: buildBody(parsed),
    });
  } catch (e) {
    if (e instanceof ApiRequestError) return { error: e.detail, fields: parsed.fields };
    return { error: "Something went wrong. Try again.", fields: parsed.fields };
  }

  redirect("/dashboard/services");
}

export async function updateServiceAction(
  serviceId: string,
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard");

  const parsed = parseFields(formData);
  const err = validate(parsed);
  if (err) return { error: err, fields: parsed.fields };

  try {
    await apiFetch<ServiceItemPublic>(`/providers/${provider.id}/services/${serviceId}`, {
      method: "PATCH",
      body: buildBody(parsed),
    });
  } catch (e) {
    if (e instanceof ApiRequestError) return { error: e.detail, fields: parsed.fields };
    return { error: "Something went wrong. Try again.", fields: parsed.fields };
  }

  redirect("/dashboard/services");
}

export async function deleteServiceAction(serviceId: string): Promise<void> {
  const provider = await getMyProvider();
  if (!provider) redirect("/dashboard");

  try {
    await apiFetch(`/providers/${provider.id}/services/${serviceId}`, { method: "DELETE" });
  } catch (e) {
    if (e instanceof ApiRequestError) throw new Error(e.detail);
    throw new Error("Could not delete service.");
  }

  redirect("/dashboard/services");
}
