"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { uploadDocumentAction } from "@/app/dashboard/settings/documents/actions";
import { DOCUMENT_KINDS } from "@/lib/verification-documents";

export function DocumentUploadForm({
  providerId,
  onUploadSuccess,
}: {
  providerId: string;
  onUploadSuccess?: () => void;
}) {
  const uploadAction = uploadDocumentAction.bind(null, providerId);
  const [state, formAction, pending] = useActionState(uploadAction, undefined);

  const [file, setFile] = useState<File | null>(null);
  const [documentKind, setDocumentKind] = useState("trade_license");
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      setFile(null);
      setValidationError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onUploadSuccess) onUploadSuccess();
    }
  }, [state, onUploadSuccess]);

  function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setValidationError("File too large (max 10MB).");
      setFile(null);
      return;
    }

    const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();
    const allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    if (!allowed.includes(extension)) {
      setValidationError("Invalid file type. Allowed formats: PDF, DOC, DOCX, JPG, PNG.");
      setFile(null);
      return;
    }

    setValidationError("");
    setFile(selectedFile);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 p-4 rounded-2xl border border-border bg-surface"
    >
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Upload verification document
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Submit each required document type. Our team will review before your business goes live.
        </p>
      </div>

      {state?.success ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-950 p-3.5 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Document uploaded successfully.</span>
        </div>
      ) : null}

      {(state?.error || validationError) ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-950 p-3.5 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{state?.error ?? validationError}</span>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
          Document type
        </span>
        <select
          name="document_kind"
          value={documentKind}
          onChange={(e) => setDocumentKind(e.target.value)}
          className="block h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          {DOCUMENT_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        name="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-accent bg-accent/5 text-accent"
              : "border-border hover:border-accent hover:bg-surface/50 text-muted hover:text-foreground"
          }`}
        >
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-xs font-semibold">
            Drag & drop your file here, or <span className="text-accent">browse</span>
          </p>
          <p className="text-[10px] text-muted mt-1">PDF, DOC, DOCX, JPG, PNG — max 10MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-border rounded-xl p-3 bg-background">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-6 w-6 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{file.name}</p>
              <p className="text-[10px] text-muted">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        type="submit"
        disabled={!file || !!validationError || pending}
        className="flex gap-2 items-center justify-center h-11 text-sm font-semibold"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload document
          </>
        )}
      </Button>
    </form>
  );
}
