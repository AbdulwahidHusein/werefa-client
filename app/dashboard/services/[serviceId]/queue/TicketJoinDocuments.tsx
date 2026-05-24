"use client";

import { ExternalLink, FileText } from "lucide-react";
import { useState, useTransition } from "react";

import { listTicketJoinDocumentsAction } from "./actions";

type Doc = {
  id: string;
  label: string;
  filename: string;
  download_url: string;
};

export function TicketJoinDocuments({
  serviceId,
  ticketId,
}: {
  serviceId: string;
  ticketId: string;
}) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    if (docs) return;
    startTransition(async () => {
      const res = await listTicketJoinDocumentsAction(serviceId, ticketId);
      if ("error" in res) {
        setError(res.error);
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
        {pending ? "Loading documents…" : docs ? "Uploaded documents" : "View uploaded documents"}
      </button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      {docs && docs.length === 0 ? (
        <p className="mt-1 text-xs text-muted">No documents on file.</p>
      ) : null}
      {docs && docs.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {docs.map((d) => (
            <li key={d.id}>
              <a
                href={d.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-foreground hover:text-accent"
              >
                {d.label}
                <span className="text-muted">({d.filename})</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
