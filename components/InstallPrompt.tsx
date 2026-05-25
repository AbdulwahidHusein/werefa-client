"use client";

import { Download, Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "werefa_install_dismissed_at";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function installDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  if (raw === "1") return true;
  const at = Number(raw);
  if (!Number.isFinite(at)) return true;
  return Date.now() - at < DISMISS_MS;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/android|iphone|ipad|ipod|mobile/i.test(ua)) return true;
  return window.innerWidth < 768;
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || !isMobile()) return;
    if (installDismissed()) return;

    setIos(isIos());
    setVisible(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") dismiss();
  }, [deferredPrompt, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title"
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              id="install-prompt-title"
              className="text-sm font-semibold text-foreground"
            >
              Install Werefa
            </p>
            <p className="mt-1 text-sm text-muted">
              {ios ? (
                <>
                  Tap <Share className="inline h-4 w-4 align-text-bottom" />{" "}
                  Share, then <strong>Add to Home Screen</strong> for the best
                  experience.
                </>
              ) : deferredPrompt ? (
                "Add Werefa to your home screen for quick access."
              ) : (
                "Open your browser menu and choose Install app or Add to Home Screen."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-xl p-2 text-muted hover:bg-surface hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!ios && deferredPrompt ? (
          <Button type="button" onClick={install}>
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" aria-hidden />
              Install app
            </span>
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={dismiss}>
            Got it
          </Button>
        )}
      </div>
    </div>
  );
}
