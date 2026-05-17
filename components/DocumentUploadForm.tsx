"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { uploadDocumentAction } from "@/app/dashboard/settings/documents/actions";

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
  const [docType, setDocType] = useState("license");
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      setFile(null);
      setValidationError("");
      if (onUploadSuccess) onUploadSuccess();
    }
  }, [state, onUploadSuccess]);

  function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;

    // Size limit check (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setValidationError("File too large (max 10MB).");
      setFile(null);
      return;
    }

    // Extension check
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  function handleRemoveFile() {
    setFile(null);
    setValidationError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <form action={formAction} className="flex flex-col gap-4 p-4 rounded-2xl border border-border bg-surface">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Upload Verification Document</h3>
        <p className="text-xs text-muted mt-0.5">Upload regulatory documents on behalf of this business</p>
      </div>

      {state?.success ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-950 p-3.5 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Document uploaded successfully!</span>
        </div>
      ) : null}

      {state?.error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-950 p-3.5 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {validationError ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-950 p-3.5 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      ) : null}

      {/* Selector: Document Type */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
          Document Type
        </span>
        <select
          name="doc_type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="block h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="license">License</option>
          <option value="permit">Permit</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
      </label>

      {/* File Drag Drop Zone */}
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        id="file-upload"
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
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 ${
            dragActive
              ? "border-accent bg-accent/5 text-accent"
              : "border-border hover:border-accent hover:bg-surface/50 text-muted hover:text-foreground"
          }`}
        >
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-xs font-semibold">
            Drag & drop your file here, or <span className="text-accent hover:underline">browse</span>
          </p>
          <p className="text-[10px] text-muted mt-1">
            Accepts PDF, DOC, DOCX, JPG, PNG (Max size: 10MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border border-border rounded-xl p-3 bg-background">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-6 w-6 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground" title={file.name}>
                {file.name}
              </p>
              <p className="text-[10px] text-muted mt-0.5">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface text-muted hover:text-foreground cursor-pointer"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        type="submit"
        disabled={!file || !!validationError || pending}
        className="flex gap-2 items-center justify-center h-11 text-sm font-semibold mt-2"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading Document...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>
    </form>
  );
}
