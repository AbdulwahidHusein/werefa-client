/** Join-time document requirements (service line settings + seeker uploads). */

export type JoinDocumentKind = "image" | "pdf" | "any";

export type JoinDocumentRequirement = {
  label: string;
  kind: JoinDocumentKind;
  kind_hint?: string;
};

export const JOIN_DOCUMENT_KIND_OPTIONS: {
  value: JoinDocumentKind;
  label: string;
  hint: string;
}[] = [
  {
    value: "image",
    label: "Photo or picture",
    hint: "JPG, PNG, or similar image",
  },
  {
    value: "pdf",
    label: "PDF document",
    hint: "PDF only",
  },
  {
    value: "any",
    label: "Photo or PDF",
    hint: "Image (JPG, PNG) or PDF",
  },
];

export function kindHint(kind: string): string {
  const row = JOIN_DOCUMENT_KIND_OPTIONS.find((o) => o.value === kind);
  return row?.hint ?? "Image or PDF";
}

export function acceptForKind(kind: string): string {
  if (kind === "image") return "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
  if (kind === "pdf") return "application/pdf,.pdf";
  return "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf";
}

export function parseRequirements(
  raw: unknown,
): JoinDocumentRequirement[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      const kind = String(o.kind ?? "any") as JoinDocumentKind;
      if (!label) return null;
      if (!["image", "pdf", "any"].includes(kind)) return null;
      return { label, kind, kind_hint: kindHint(kind) };
    })
    .filter((x): x is JoinDocumentRequirement => x !== null);
}

export function clientMimeAllowed(file: File, kind: string): boolean {
  const ct = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (kind === "image") {
    return ct.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/.test(name);
  }
  if (kind === "pdf") {
    return ct === "application/pdf" || name.endsWith(".pdf");
  }
  return (
    ct.startsWith("image/") ||
    ct === "application/pdf" ||
    /\.(jpe?g|png|webp|gif|heic|heif|pdf)$/.test(name)
  );
}
