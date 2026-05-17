"use client";

import { QrCode, Copy, Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { api } from "@/lib/api/client";

type InviteCreated = { token: string; expires_at: string };

export function GenerateInviteButton({ serviceId }: { serviceId: string }) {
  const [open, setOpen] = useState(false);
  const [ttlHours, setTtlHours] = useState(1);
  const [pending, setPending] = useState(false);
  const [invite, setInvite] = useState<InviteCreated | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const inviteUrl = invite 
    ? `${window.location.origin}/join?token=${invite.token}` 
    : "";

  async function generateInvite(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setInvite(null);
    setCopied(false);

    try {
      const res = await api<InviteCreated>(
        `/service-items/${serviceId}/join-invites`,
        {
          method: "POST",
          body: { ttl_hours: ttlHours },
        }
      );
      setInvite(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invite.");
    } finally {
      setPending(false);
    }
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "werefa-invite-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-zinc-100"
      >
        <QrCode className="h-4 w-4" />
        Generate Invite Link
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Share Invite">
        {!invite ? (
          <form onSubmit={generateInvite} className="flex flex-col gap-4 pb-4">
            <p className="text-sm text-muted">
              Create a temporary QR code and deep link that customers can scan to join the queue automatically.
            </p>

            <div>
              <label htmlFor="ttlHours" className="mb-1 block text-sm font-medium">
                Expires in
              </label>
              <select
                id="ttlHours"
                value={ttlHours}
                onChange={(e) => setTtlHours(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value={1}>1 Hour</option>
                <option value={4}>4 Hours</option>
                <option value={8}>8 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 pb-4 pt-2">
            <div className="rounded-2xl border-4 border-white bg-white p-2 shadow-sm">
              <QRCodeSVG
                value={inviteUrl}
                size={200}
                level="M"
                includeMargin={false}
                ref={svgRef}
              />
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
                <div className="flex-1 overflow-x-auto whitespace-nowrap px-2 text-xs text-muted scrollbar-hide">
                  {inviteUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleDownload} className="flex-1">
                  <Download className="mr-2 h-4 w-4" /> Download SVG
                </Button>
                <Button onClick={() => setInvite(null)} className="flex-1">
                  Create New
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted">
              Invite valid until {new Date(invite.expires_at).toLocaleString()}
            </p>
          </div>
        )}
      </Sheet>
    </>
  );
}
