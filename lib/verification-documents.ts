export const DOCUMENT_KINDS = [
  { value: "trade_license", label: "Trade / business license" },
  { value: "owner_id", label: "Owner ID (national ID or passport)" },
  { value: "address_proof", label: "Proof of address" },
  { value: "health_permit", label: "Health / sanitation permit" },
  { value: "establishment_letter", label: "Official establishment letter" },
  { value: "tin_certificate", label: "TIN certificate" },
  { value: "other", label: "Other supporting document" },
] as const;

export const REQUIRED_KINDS = [
  "trade_license",
  "owner_id",
  "address_proof",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]["value"];

export function kindLabel(kind: string): string {
  return DOCUMENT_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export type VerificationRequirements = {
  required_kinds: string[];
  uploaded_kinds: string[];
  missing_kinds: string[];
  ready_for_review: boolean;
  is_verified?: boolean;
};
