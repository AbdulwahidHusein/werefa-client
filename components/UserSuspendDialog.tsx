"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { suspendUserAction } from "@/app/admin/actions";

type UserRow = {
  id: string;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  is_suspended: boolean;
  user_type: string;
};

export function UserSuspendDialog({
  user,
  onClose,
  onSuccess,
}: {
  user: UserRow;
  onClose: () => void;
  onSuccess: (updatedUser: UserRow) => void;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;

    setPending(true);
    setError(null);

    const res = await suspendUserAction(user.id, reason);
    setPending(false);

    if (res.ok && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Failed to suspend user.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => { if (!pending) onClose(); }}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Suspend Account?</h3>
              <p className="text-[10px] text-muted font-medium">This will immediately block their remote queue access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-1 text-muted hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs text-muted leading-relaxed">
          Are you sure you want to suspend <strong className="text-foreground">{user.email}</strong>? They will be locked out of checking their active tickets, placing reviews, and joining queues.
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-950">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="suspendReason" className="text-xs font-semibold text-foreground">
              Reason for suspension
            </label>
            <textarea
              id="suspendReason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Repeated no-show manipulation or abusive profile names..."
              className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed placeholder:text-zinc-400"
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !reason.trim()}
              className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-rose-700 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Confirm Suspend"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
