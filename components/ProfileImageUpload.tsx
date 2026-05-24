"use client";

import { useActionState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

type UploadState = { error?: string; success?: boolean } | undefined;

type Props = {
  label: string;
  imageUrl?: string | null;
  uploadAction: (prev: UploadState, formData: FormData) => Promise<UploadState>;
  fallbackName?: string;
};

export function ProfileImageUpload({ label, imageUrl, uploadAction, fallbackName }: Props) {
  const [state, action, pending] = useActionState(uploadAction, undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = fallbackName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <form action={action} className="flex items-center gap-3">
      {/* Avatar thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted bg-accent/10 text-accent">
            {initial}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) e.target.form?.requestSubmit();
        }}
      />

      <div className="flex-1 min-w-0">
        {label ? <p className="text-xs font-medium text-muted mb-1">{label}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
          ) : (
            <><Camera className="h-3.5 w-3.5" /> {imageUrl ? "Change logo" : "Upload logo"}</>
          )}
        </button>
        {state?.error ? (
          <p className="mt-1 text-xs text-danger" role="alert">{state.error}</p>
        ) : null}
        {state?.success ? (
          <p className="mt-1 text-xs text-emerald-700">Logo updated.</p>
        ) : null}
      </div>
    </form>
  );
}
