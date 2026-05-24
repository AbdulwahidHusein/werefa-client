"use client";

import { Download, FileText, X } from "lucide-react";
import { useEffect } from "react";

import {
  isImageDocument,
  isPdfDocument,
  type PreviewableDocument,
} from "@/lib/document-preview";

export function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: PreviewableDocument | null;
  onClose: () => void;
}) {
  const open = doc !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!doc) return null;

  const isImage = isImageDocument(doc);
  const isPdf = isPdfDocument(doc);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${doc.label}`}
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/55 backdrop-blur-[2px]"
      />

      <div className="relative z-10 flex max-h-[min(92dvh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{doc.label}</p>
            <p className="truncate text-xs text-muted">{doc.filename}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={doc.download_url}
              target="_blank"
              rel="noopener noreferrer"
              download={doc.filename}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium hover:bg-surface"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-zinc-100/80 p-3 sm:p-4">
          {isImage ? (
            <div className="flex min-h-[200px] items-center justify-center sm:min-h-[320px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.download_url}
                alt={doc.label}
                className="max-h-[min(70dvh,640px)] w-auto max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          ) : isPdf ? (
            <iframe
              title={doc.label}
              src={doc.download_url}
              className="h-[min(70dvh,640px)] w-full rounded-lg border border-border bg-white shadow-sm"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-muted" />
              <p className="max-w-xs text-sm text-muted">
                Preview is not available for this file type. Use download to open
                it on your device.
              </p>
              <a
                href={doc.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:underline"
              >
                Open file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
