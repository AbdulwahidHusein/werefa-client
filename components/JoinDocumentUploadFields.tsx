"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";

import {
  acceptForKind,
  clientMimeAllowed,
  kindHint,
  type JoinDocumentRequirement,
} from "@/lib/join-documents";

export function JoinDocumentUploadFields({
  requirements,
}: {
  requirements: JoinDocumentRequirement[];
}) {
  const [errors, setErrors] = useState<Record<number, string>>({});

  if (requirements.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <FileUp className="h-4 w-4 text-accent" />
        Documents required to join
      </p>
      <p className="mt-1 text-xs text-muted">
        Upload each file below. Your join will not go through until all are attached.
      </p>
      <ul className="mt-3 space-y-3">
        {requirements.map((req, index) => (
          <li key={index}>
            <label className="block text-sm font-medium">
              {req.label}
              <span className="mt-0.5 block text-xs font-normal text-muted">
                {req.kind_hint ?? kindHint(req.kind)}
              </span>
            </label>
            <input
              type="file"
              name={`document_${index}`}
              required
              accept={acceptForKind(req.kind)}
              className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-foreground"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next[index];
                  return next;
                });
                if (!file) return;
                if (!clientMimeAllowed(file, req.kind)) {
                  setErrors((prev) => ({
                    ...prev,
                    [index]: `Please choose ${kindHint(req.kind).toLowerCase()}.`,
                  }));
                  e.target.value = "";
                }
              }}
            />
            {errors[index] ? (
              <p className="mt-1 text-xs text-danger">{errors[index]}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
