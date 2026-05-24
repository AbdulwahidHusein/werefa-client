"use client";

import { FileImage, FileText } from "lucide-react";
import { useState } from "react";

import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import {
  isImageDocument,
  isPdfDocument,
  type PreviewableDocument,
} from "@/lib/document-preview";

function DocIcon({ doc }: { doc: PreviewableDocument }) {
  if (isImageDocument(doc)) {
    return <FileImage className="h-4 w-4 text-accent" aria-hidden />;
  }
  if (isPdfDocument(doc)) {
    return <FileText className="h-4 w-4 text-rose-600" aria-hidden />;
  }
  return <FileText className="h-4 w-4 text-muted" aria-hidden />;
}

export function DocumentPreviewList({
  documents,
  className = "",
}: {
  documents: PreviewableDocument[];
  className?: string;
}) {
  const [preview, setPreview] = useState<PreviewableDocument | null>(null);

  if (documents.length === 0) {
    return <p className="text-xs text-muted">No documents on file.</p>;
  }

  return (
    <>
      <ul
        className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${className}`.trim()}
      >
        {documents.map((d) => (
          <li key={d.id ?? `${d.label}-${d.filename}`}>
            <button
              type="button"
              onClick={() => setPreview(d)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface">
                <DocIcon doc={d} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{d.label}</span>
                <span className="block truncate text-xs text-muted">
                  {d.filename}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-accent">
                View
              </span>
            </button>
          </li>
        ))}
      </ul>

      <DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} />
    </>
  );
}
