export type PreviewableDocument = {
  id?: string;
  label: string;
  filename: string;
  content_type?: string;
  download_url: string;
};

export function isImageDocument(doc: PreviewableDocument): boolean {
  const ct = (doc.content_type ?? "").toLowerCase();
  if (ct.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(doc.filename);
}

export function isPdfDocument(doc: PreviewableDocument): boolean {
  const ct = (doc.content_type ?? "").toLowerCase();
  if (ct === "application/pdf") return true;
  return /\.pdf$/i.test(doc.filename);
}
