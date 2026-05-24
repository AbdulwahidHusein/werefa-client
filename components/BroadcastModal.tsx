"use client";

import { useState, useTransition } from "react";
import { X, Megaphone, Loader2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { createBroadcastAction } from "@/app/dashboard/services/[serviceId]/queue/actions";
import { Button } from "@/components/ui/Button";

type Service = {
  id: string;
  name: string;
};

export function BroadcastModal({
  isOpen,
  onClose,
  providerId,
  services,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  services: Service[];
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("info");
  const [selectedServices, setSelectedServices] = useState<string[]>(["ALL"]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const charCount = message.length;
  const isTooLong = charCount > 500;

  function handleServiceChange(id: string) {
    if (id === "ALL") {
      setSelectedServices(["ALL"]);
    } else {
      let updated = selectedServices.filter((s) => s !== "ALL");
      if (updated.includes(id)) {
        updated = updated.filter((s) => s !== id);
      } else {
        updated.push(id);
      }
      // If nothing is selected, default to ALL
      if (updated.length === 0) {
        setSelectedServices(["ALL"]);
      } else {
        setSelectedServices(updated);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || isTooLong || isPending) return;

    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      const result = await createBroadcastAction(
        providerId,
        message,
        severity,
        selectedServices
      );

      if (!result.ok) {
        setErrorMessage(result.error || "Failed to post message.");
      } else {
        // Successful creation! Show success message
        setSuccessMessage("Posted to the line.");
        setMessage("");
        setSeverity("info");
        setSelectedServices(["ALL"]);
        onSuccess();
        
        // Auto-close modal after a brief duration
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 2000);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-muted hover:bg-surface hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-accent/10 text-accent">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none">Post to line</h3>
            <p className="text-xs text-muted mt-1">Your message appears in the line chat on every waiting ticket.</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-950 p-3 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-950 p-3 text-xs font-semibold">
            <Info className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
              Message (Max 500 chars)
            </label>
            <textarea
              required
              rows={4}
              maxLength={600}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Due to power outage, our queue is delayed by 15 minutes."
              className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm transition-all focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none"
            />
            <div className="flex justify-between text-[11px] px-0.5">
              <span className="text-muted">Avoid long text to prevent customer overflow</span>
              <span className={isTooLong ? "text-danger font-semibold" : "text-muted"}>
                {charCount}/500
              </span>
            </div>
          </div>

          {/* Severity Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: "info", label: "Info", icon: Info, bg: "border-blue-200 text-blue-800 bg-blue-50/40" },
                { value: "warning", label: "Warning", icon: AlertTriangle, bg: "border-amber-200 text-amber-800 bg-amber-50/40" },
                { value: "critical", label: "Urgent", icon: AlertCircle, bg: "border-rose-200 text-rose-800 bg-rose-50/40" },
              ].map((sev) => {
                const isSelected = severity === sev.value;
                const Icon = sev.icon;
                return (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setSeverity(sev.value as any)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? sev.bg + " border-accent ring-1 ring-accent"
                        : "border-border hover:bg-surface text-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {sev.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services Checkboxes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
              Target Service Lines
            </label>
            <div className="max-h-36 overflow-y-auto border border-border rounded-2xl p-3 space-y-2 bg-surface/50">
              {/* All services option */}
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes("ALL")}
                  onChange={() => handleServiceChange("ALL")}
                  className="rounded border-border text-accent focus:ring-accent h-4 w-4"
                />
                <span>All Service Lines (Provider Wide)</span>
              </label>

              {services.map((svc) => (
                <label key={svc.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(svc.id)}
                    onChange={() => handleServiceChange(svc.id)}
                    className="rounded border-border text-accent focus:ring-accent h-4 w-4"
                  />
                  <span>{svc.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || charCount === 0 || isTooLong}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                "Post message"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
