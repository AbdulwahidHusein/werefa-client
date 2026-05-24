"use client";

import { FileText } from "lucide-react";
import { useState, useTransition } from "react";

import { DocumentPreviewList } from "@/components/DocumentPreviewList";
import { listTicketJoinDocumentsAction } from "./actions";
import type { PreviewableDocument } from "@/lib/document-preview";

export function TicketJoinDocuments({
  serviceId,
  ticketId,
}: {
  serviceId: string;
  ticketId: string;
}) {
  const [docs, setDocs] = useState<PreviewableDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    if (docs) return;
    startTransition(async () => {
      const res = await listTicketJoinDocumentsAction(serviceId, ticketId);
      if ("error" in res) {
        setError(
          res.error === "Internal Server Error"
            ? "Could not load documents. Try again in a moment."
            : res.error,
        );
        return;
      }
      setDocs(res.data);
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={load}
        disabled={pending}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline disabled:opacity-60"
      >
        <FileText className="h-3.5 w-3.5" />
        {pending
          ? "Loading documents…"
          : docs
            ? "Uploaded documents"
            : "View uploaded documents"}
      </button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      {docs ? (
        <div className="mt-2">
          <DocumentPreviewList documents={docs} />
        </div>
      ) : null}
    </div>
  );
}
