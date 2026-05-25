"use client";

import { useEffect, useRef, useState } from "react";
import {
  Crown,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { useLineChat, type LineChatMessage } from "@/hooks/useLineChat";
import { api } from "@/lib/api/client";

function formatTime(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function MessageRow({
  message,
  isMine,
}: {
  message: LineChatMessage;
  isMine: boolean;
}) {
  const isOwner = message.author_role === "owner";
  const isStaff = message.author_role === "staff";

  return (
    <li className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[78%] ${
          isMine
            ? "rounded-br-md bg-accent text-accent-foreground"
            : isOwner
              ? "rounded-bl-md border border-accent/30 bg-accent/10 text-foreground"
              : isStaff
                ? "rounded-bl-md border border-border bg-surface text-foreground"
                : "rounded-bl-md border border-border bg-background text-foreground"
        }`}
      >
        {!isMine ? (
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {isOwner ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                <Crown className="h-3 w-3" aria-hidden />
                Owner
              </span>
            ) : isStaff ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                Team
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-muted">Customer</span>
            )}
            <span className="text-[10px] text-muted">{message.author_label}</span>
          </div>
        ) : null}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.body}
        </p>
        <p
          className={`mt-1 text-[10px] ${isMine ? "text-accent-foreground/70" : "text-muted"}`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </li>
  );
}

type PanelVariant = "floating" | "embedded";

function LineChatOwnerToggle({
  lineChatEnabled,
  toggling,
  onToggle,
}: {
  lineChatEnabled: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface/50 px-4 py-2">
      <span className="text-xs text-muted">Customer messages</span>
      <button
        type="button"
        disabled={toggling}
        onClick={onToggle}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          lineChatEnabled
            ? "bg-emerald-100 text-emerald-800"
            : "bg-zinc-200 text-zinc-700"
        }`}
      >
        {lineChatEnabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

function LineChatBody({
  variant,
  title,
  isOwner,
  lineChatEnabled,
  toggling,
  onToggleChat,
  onClose,
  messages,
  loading,
  error,
  currentUserId,
  draft,
  setDraft,
  sending,
  onSend,
}: {
  variant: PanelVariant;
  title: string;
  isOwner: boolean;
  lineChatEnabled: boolean;
  toggling: boolean;
  onToggleChat: () => void;
  onClose?: () => void;
  messages: LineChatMessage[];
  loading: boolean;
  error: string | null;
  currentUserId?: string;
  draft: string;
  setDraft: (v: string) => void;
  sending: boolean;
  onSend: (e: React.FormEvent) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const embedded = variant === "embedded";
  const canSend = lineChatEnabled && draft.trim().length > 0 && !sending;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const shellClass = embedded
    ? "flex min-h-[min(20rem,42vh)] w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm sm:min-h-[min(24rem,48vh)] lg:min-h-[min(32rem,calc(100dvh-11rem))] lg:max-h-[calc(100dvh-8rem)]"
    : "fixed inset-0 z-50 flex flex-col bg-background md:inset-auto md:bottom-6 md:right-4 md:h-[min(560px,82vh)] md:w-[min(440px,calc(100vw-2rem))] md:rounded-2xl md:border md:border-border md:shadow-2xl";

  return (
    <div className={shellClass}>
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold sm:text-base">{title}</h2>
          <p className="text-[11px] text-muted sm:text-xs">
            Everyone on this line can chat
          </p>
        </div>
        {!embedded && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl hover:bg-surface"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </header>

      {isOwner ? (
        <LineChatOwnerToggle
          lineChatEnabled={lineChatEnabled}
          toggling={toggling}
          onToggle={onToggleChat}
        />
      ) : null}

      <ul
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {loading ? (
          <li className="text-center text-xs text-muted">Loading…</li>
        ) : messages.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-xs text-muted sm:text-sm">
            {lineChatEnabled
              ? "No messages yet. Say hello to the line."
              : "Chat is turned off by the business."}
          </li>
        ) : (
          messages.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              isMine={!!currentUserId && m.author_user_id === currentUserId}
            />
          ))
        )}
      </ul>

      {error ? (
        <p className="shrink-0 px-4 pb-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSend}
        className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
      >
        {!lineChatEnabled ? (
          <p className="mb-2 text-center text-xs text-muted">
            The business has paused customer chat.
          </p>
        ) : null}
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            disabled={!lineChatEnabled || sending}
            placeholder={lineChatEnabled ? "Type a message…" : "Chat disabled"}
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:py-3 sm:text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground disabled:opacity-40 sm:h-12 sm:w-12"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export function QueueLineChatPanel({
  serviceItemId,
  providerId,
  businessName,
  currentUserId,
  wsClient,
  isOwner = false,
  initialChatEnabled = true,
  variant = "floating",
}: {
  serviceItemId: string;
  providerId?: string;
  businessName?: string;
  currentUserId?: string;
  wsClient?: { onMessage: (cb: (msg: unknown) => void) => () => void } | null;
  isOwner?: boolean;
  initialChatEnabled?: boolean;
  variant?: PanelVariant;
}) {
  const [open, setOpen] = useState(variant === "embedded");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);

  const {
    messages,
    lineChatEnabled,
    loading,
    error,
    postMessage,
    setChatEnabled,
  } = useLineChat({
    serviceItemId,
    wsClient,
    enabled: true,
  });

  useEffect(() => {
    setChatEnabled(initialChatEnabled);
  }, [initialChatEnabled, setChatEnabled]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending || !lineChatEnabled) return;
    setSending(true);
    const ok = await postMessage(draft);
    setSending(false);
    if (ok) setDraft("");
  }

  async function handleToggleChat() {
    if (!isOwner || !providerId || toggling) return;
    const next = !lineChatEnabled;
    setToggling(true);
    try {
      await api(`/providers/${providerId}/services/${serviceItemId}`, {
        method: "PATCH",
        body: { line_chat_enabled: next },
      });
      setChatEnabled(next);
    } catch {
      // keep previous state
    } finally {
      setToggling(false);
    }
  }

  const title = businessName ? `${businessName} chat` : "Line chat";
  const bodyProps = {
    variant,
    title,
    isOwner,
    lineChatEnabled,
    toggling,
    onToggleChat: handleToggleChat,
    messages,
    loading,
    error,
    currentUserId,
    draft,
    setDraft,
    sending,
    onSend: handleSend,
  };

  if (variant === "embedded") {
    return <LineChatBody {...bodyProps} />;
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-lg hover:bg-accent-hover md:bottom-6"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Line chat
          {messages.length > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background/20 px-1.5 text-xs">
              {messages.length}
            </span>
          ) : null}
        </button>
      ) : null}

      {open ? (
        <LineChatBody {...bodyProps} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
