"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { requireMe } from "@/lib/dal";

export type UploadState = { error?: string; success?: boolean } | undefined;

const SAFE_EXTS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const SAFE_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export async function uploadDocumentAction(
  providerId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const me = await requireMe();
  if (!me.is_superuser) {
    return { error: "Only system administrators can upload provider documents." };
  }

  const file = formData.get("file") as File | null;
  const docType = String(formData.get("doc_type") ?? "").trim().toLowerCase();

  if (!file || file.size === 0) {
    return { error: "Please select a file to upload." };
  }

  // 10MB limit: 10 * 1024 * 1024 bytes
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File too large (max 10MB)." };
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const mimeType = file.type;

  if (!SAFE_EXTS.includes(extension) && !SAFE_MIMES.includes(mimeType)) {
    return { error: "Invalid file type. Allowed formats: PDF, DOC, DOCX, JPG, PNG." };
  }

  const typeLabel = docType.charAt(0).toUpperCase() + docType.slice(1);
  const cleanDocType = ["license", "permit", "insurance"].includes(docType) ? typeLabel : "Other";
  const prefixedName = `[${cleanDocType}] ${file.name}`;

  const serverFormData = new FormData();
  // Wrap into a File with the prefixed name
  const prefixedFile = new File([file], prefixedName, { type: file.type });
  serverFormData.append("file", prefixedFile);

  try {
    await apiFetch(`/admin/providers/${providerId}/documents`, {
      method: "POST",
      body: serverFormData,
    });

    revalidatePath("/dashboard/settings/documents");
    revalidatePath(`/admin/providers/${providerId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.detail || "Upload failed." };
    }
    return { error: "An unexpected error occurred. Try again." };
  }
}
