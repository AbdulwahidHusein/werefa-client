"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { requireProvider } from "@/lib/dal";

export type UploadState = { error?: string; success?: boolean } | undefined;

const SAFE_EXTS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const SAFE_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const ALLOWED_KINDS = new Set([
  "trade_license",
  "owner_id",
  "address_proof",
  "health_permit",
  "establishment_letter",
  "tin_certificate",
  "other",
]);

export async function uploadDocumentAction(
  providerId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireProvider();

  const file = formData.get("file") as File | null;
  const documentKind = String(formData.get("document_kind") ?? "").trim().toLowerCase();

  if (!ALLOWED_KINDS.has(documentKind)) {
    return { error: "Please select a valid document type." };
  }

  if (!file || file.size === 0) {
    return { error: "Please select a file to upload." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large (max 10MB)." };
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const mimeType = file.type;

  if (!SAFE_EXTS.includes(extension) && !SAFE_MIMES.includes(mimeType)) {
    return { error: "Invalid file type. Allowed formats: PDF, DOC, DOCX, JPG, PNG." };
  }

  const serverFormData = new FormData();
  serverFormData.append("file", file);
  serverFormData.append("document_kind", documentKind);

  try {
    await apiFetch(`/providers/${providerId}/documents`, {
      method: "POST",
      body: serverFormData,
    });

    revalidatePath("/dashboard/settings/documents");
    revalidatePath("/dashboard/settings/profile");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.detail || "Upload failed." };
    }
    return { error: "An unexpected error occurred. Try again." };
  }
}
