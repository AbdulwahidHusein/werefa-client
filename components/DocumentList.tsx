"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import type { components } from "@/lib/api/schema";

export type ProviderDocument = {
  id: string;
  provider_id: string;
  filename: string;
  created_at?: string | null;
  url?: string;
};

function parseDocumentInfo(filename: string) {
  const match = filename.match(/^\[(License|Permit|Insurance|Other)\]\s*(.*)$/i);
  if (match) {
    return {
      type: match[1],
      cleanName: match[2],
    };
  }
  return {
    type: "Other",
    cleanName: filename,
  };
}

export function DocumentList({
  documents,
  providerId,
}: {
  documents: ProviderDocument[];
  providerId: string;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(
    docId: string,
    filename: string,
    directUrl?: string,
  ) {
    setDownloadingId(docId);
    try {
      const { cleanName } = parseDocumentInfo(filename);
      const href =
        directUrl ??
        `/api/providers/${providerId}/documents/${docId}`;

      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", cleanName);
      if (directUrl) link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      alert("Failed to download document. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface/50">
        <FileText className="h-8 w-8 text-muted mx-auto mb-2" />
        <p className="text-sm font-medium">No documents uploaded yet</p>
        <p className="mt-1 text-xs text-muted">
          KYC files are uploaded by system administrators during registration checks.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <ul className="divide-y divide-border/60">
        {documents.map((doc) => {
          const { type, cleanName } = parseDocumentInfo(doc.filename);
          const uploadDate = doc.created_at
            ? new Date(doc.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Unknown";

          const isDownloading = downloadingId === doc.id;

          return (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-surface/50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground" title={cleanName}>
                    {cleanName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-800">
                      {type}
                    </span>
                    <span className="text-[10px] text-muted">Uploaded: {uploadDate}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(doc.id, doc.filename, doc.url)}
                disabled={isDownloading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background hover:bg-surface text-muted hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Download file"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
