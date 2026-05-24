"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProviderLogo } from "@/components/ProviderLogo";

type UploadState = { error?: string; success?: boolean } | undefined;

type Props = {
  businessName: string;
  imageUrl?: string | null;
  uploadAction: (prev: UploadState, formData: FormData) => Promise<UploadState>;
  disabled?: boolean;
};

export function BusinessLogoUpload({
  businessName,
  imageUrl,
  uploadAction,
  disabled = false,
}: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(uploadAction, undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || imageUrl || null;

  useEffect(() => {
    if (state?.success) {
      setPreview(null);
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFileChosen(file: File | undefined) {
    if (!file || disabled || pending) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.form?.requestSubmit();
  }

  return (
    <form action={action} className="flex flex-col items-center gap-5 p-5 sm:p-6">
      <div className="relative">
        <ProviderLogo
          name={businessName}
          imageUrl={displayUrl}
          size="xl"
          variant="upload"
          className={pending ? "opacity-60" : ""}
        />
        {pending ? (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/20">
            <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden />
          </div>
        ) : null}
        {state?.success && !pending ? (
          <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white shadow-md">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>

      <div className="w-full max-w-sm text-center">
        <p className="text-sm font-semibold text-foreground">{businessName}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Square logos work best. Shown on your public page, discover list, and map.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        disabled={disabled || pending}
        onChange={(e) => onFileChosen(e.target.files?.[0])}
      />

      {!disabled ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => !pending && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-accent", "bg-accent/5");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-accent", "bg-accent/5");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-accent", "bg-accent/5");
            onFileChosen(e.dataTransfer.files?.[0]);
          }}
          className="flex w-full max-w-md cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-6 transition-colors hover:border-accent/50 hover:bg-surface/80"
        >
          {pending ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
              <span className="text-sm font-medium text-muted">Uploading…</span>
            </>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {displayUrl ? (
                  <Camera className="h-5 w-5" aria-hidden />
                ) : (
                  <ImagePlus className="h-5 w-5" aria-hidden />
                )}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {displayUrl ? "Replace logo" : "Upload logo"}
              </span>
              <span className="text-xs text-muted">
                Drag & drop or tap · JPEG, PNG, WebP · max 5 MB
              </span>
            </>
          )}
        </div>
      ) : null}

      {preview && !pending ? (
        <button
          type="button"
          onClick={clearPreview}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Cancel preview
        </button>
      ) : null}

      {state?.error ? (
        <p className="w-full max-w-md rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success && !pending ? (
        <p className="text-xs font-medium text-emerald-700">Logo saved successfully.</p>
      ) : null}
    </form>
  );
}
