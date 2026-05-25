"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  Crown,
  Loader2,
  Mail,
  Phone,
  Settings,
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import type { ServiceLineStat } from "@/lib/provider-routes";
import { CallNextButton } from "./CallNextButton";
import { RecallButton } from "./RecallButton";
import { ServingActions } from "./ServingActions";
import { WalkInForm } from "./WalkInForm";
import { QueueBoardSettings } from "./QueueBoardSettings";
import { QueueLineChatPanel } from "@/components/QueueLineChatPanel";
import { TicketJoinDocuments } from "./TicketJoinDocuments";
import type { JoinDocumentRequirement } from "@/lib/join-documents";
import { approveTicketAction, rejectTicketAction } from "./actions";
import {
  type QueueActionState,
  isQueueActionOk,
  queueActionError,
} from "./queue-action-utils";
import {
  ticketContactLines,
  ticketDisplayName,
  type QueueTicketExtra,
} from "@/lib/queue-customer";
import { NotifyCustomerButton } from "./NotifyCustomerButton";
import { VIPToggleButton } from "./VIPToggleButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { PageHeader } from "@/components/ui/PageHeader";
import { useQueueStream } from "@/hooks/useQueueStream";
import type { components } from "@/lib/api/schema";
import { TicketLivenessDetailsPanel } from "@/components/TicketLivenessStatus";

type Ticket = components["schemas"]["QueueEntryPublic"] &
  QueueTicketExtra & {
    close_reason?: string | null;
  };
type Tab = "queue" | "settings";

function relativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function sortByJoined(a: Ticket, b: Ticket) {
  return (a.joined_at ? Date.parse(a.joined_at) : 0) - (b.joined_at ? Date.parse(b.joined_at) : 0);
}

function sortByPriorityThenJoined(
  a: Ticket & { priority?: number },
  b: Ticket & { priority?: number },
) {
  const pa = a.priority ?? 0;
  const pb = b.priority ?? 0;
  if (pb !== pa) return pb - pa;
  return (a.joined_at ? Date.parse(a.joined_at) : 0) - (b.joined_at ? Date.parse(b.joined_at) : 0);
}

function TicketContactDetails({ t }: { t: Ticket }) {
  const { email, phone } = ticketContactLines(t);
  if (!email && !phone) return null;
  return (
    <div className="mt-0.5 space-y-0.5">
      {phone ? (
        <p className="flex items-center gap-1 truncate text-xs text-muted">
          <Phone className="h-3 w-3 shrink-0" />
          {phone}
        </p>
      ) : null}
      {email ? (
        <p className="flex items-center gap-1 truncate text-xs text-muted">
          <Mail className="h-3 w-3 shrink-0" />
          {email}
        </p>
      ) : null}
    </div>
  );
}

function PendingApprovalRow({
  t,
  serviceId,
  onActionDone,
}: {
  t: Ticket;
  serviceId: string;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [pending, startTransition] = useTransition();

  function act(fn: () => Promise<QueueActionState>) {
    startTransition(async () => {
      const res = await fn();
      if (isQueueActionOk(res)) onActionDone?.(res.message ?? "Done.");
      else onActionDone?.(queueActionError(res), "err");
    });
  }

  return (
    <li className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-bold text-indigo-950">#{t.ticket_number}</p>
          <p className="font-medium">{ticketDisplayName(t)}</p>
          <TicketContactDetails t={t} />
          <p className="mt-1 text-xs text-indigo-800/80">
            Asked to join {relativeTime(t.joined_at) ?? "—"}
          </p>
          {t.source === "remote_app" ? (
            <TicketJoinDocuments serviceId={serviceId} ticketId={t.id} />
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => approveTicketAction(serviceId, t.id))}
            className="flex-1 cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
          >
            <Check className="mr-1 inline h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => rejectTicketAction(serviceId, t.id))}
            className="flex-1 cursor-pointer rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface disabled:opacity-50 sm:flex-none"
          >
            Decline
          </button>
        </div>
      </div>
    </li>
  );
}

function WaitingRow({
  t,
  serviceId,
  position,
  allowVip,
  onActionDone,
}: {
  t: Ticket & { priority?: number };
  serviceId: string;
  position: number;
  allowVip?: boolean;
  onActionDone?: (msg: string, variant?: "ok" | "err") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isWalkIn = t.source !== "remote_app";
  const isVip = (t.priority ?? 0) > 0;
  const canNotify = !isWalkIn && Boolean(t.user_id);

  return (
    <li
      className={`rounded-xl border bg-background p-3 ${
        isVip ? "border-amber-200" : "border-border"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${!isWalkIn ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (!isWalkIn) setExpanded(!expanded);
        }}
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
            isVip ? "bg-amber-100 text-amber-800" : "bg-surface text-muted"
          }`}
        >
          {isVip ? <Crown className="h-4 w-4" /> : position}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            #{t.ticket_number} · {ticketDisplayName(t)}
          </p>
          <TicketContactDetails t={t} />
          <p className="text-xs text-muted">
            {isWalkIn ? "Walk-in" : "App"} · {relativeTime(t.joined_at) ?? "—"}
          </p>
        </div>
        <div
          className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <NotifyCustomerButton
            serviceId={serviceId}
            ticketId={t.id}
            ticketNumber={t.ticket_number}
            canNotify={canNotify}
            onActionDone={onActionDone}
          />
          {allowVip ? (
            <VIPToggleButton
              serviceId={serviceId}
              ticketId={t.id}
              isVip={isVip}
              onActionDone={onActionDone}
            />
          ) : null}
        </div>
      </div>
      {expanded && !isWalkIn ? (
        <div className="mt-2 border-t border-border pt-2 space-y-2">
          <TicketJoinDocuments serviceId={serviceId} ticketId={t.id} />
          <TicketLivenessDetailsPanel serviceId={serviceId} ticketId={t.id} />
        </div>
      ) : null}
    </li>
  );
}

type Toast = { id: number; message: string; variant: "ok" | "err" };

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${
            t.variant === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function LiveIndicator({
  wsState,
  isRefreshing,
  onRefresh,
}: {
  wsState: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  if (wsState === "connected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <Wifi className="h-3.5 w-3.5" />
        Live
      </span>
    );
  }
  if (wsState === "connecting") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Connecting…
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isRefreshing}
      className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted disabled:opacity-50"
    >
      {isRefreshing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-rose-500" />
      )}
      Tap to refresh
    </button>
  );
}

function BoardTabs({
  tab,
  setTab,
  pendingCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  pendingCount: number;
}) {
  return (
    <div className="mb-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => setTab("queue")}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
          tab === "queue"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <Users className="h-4 w-4" />
        Queue
        {pendingCount > 0 ? (
          <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
            {pendingCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => setTab("settings")}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
          tab === "settings"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
    </div>
  );
}

export function QueueBoardClient({
  serviceId,
  serviceName,
  initialTickets,
  token,
  providerId,
  businessName,
  allServices,
  initialIsPaused,
  allowVip = false,
  lineChatEnabled = true,
  requiresJoinApproval = false,
  approvalQueueOrder = "preserve_register_time",
  requiresJoinDocuments = false,
  joinDocumentRequirements = [],
  isOwner = false,
  currentUserId,
  serviceLineStats = [],
}: {
  serviceId: string;
  serviceName: string;
  initialTickets: Ticket[];
  token: string | null;
  providerId: string;
  businessName?: string;
  allServices: { id: string; name: string }[];
  initialIsPaused: boolean;
  allowVip?: boolean;
  lineChatEnabled?: boolean;
  requiresJoinApproval?: boolean;
  approvalQueueOrder?: "preserve_register_time" | "approval_time";
  requiresJoinDocuments?: boolean;
  joinDocumentRequirements?: JoinDocumentRequirement[];
  isOwner?: boolean;
  currentUserId?: string;
  serviceLineStats?: ServiceLineStat[];
}) {
  const [tab, setTab] = useState<Tab>("queue");
  const [isPaused, setIsPaused] = useState(initialIsPaused);
  const [chatEnabled, setChatEnabled] = useState(lineChatEnabled);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const notify = useCallback((message: string, variant: "ok" | "err" = "ok") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const { tickets, wsState, isRefreshing, refreshTickets, client } = useQueueStream(
    serviceId,
    initialTickets,
    token,
  );

  const serving = tickets.filter((t) => t.status === "serving").sort(sortByJoined);
  const pendingApproval = tickets
    .filter((t) => t.status === "pending_approval")
    .sort(sortByJoined);
  const waiting = tickets.filter((t) => t.status === "waiting").sort(sortByPriorityThenJoined);
  const completed = tickets
    .filter((t) => t.status === "completed")
    .sort(
      (a, b) =>
        (b.completed_at ? Date.parse(b.completed_at) : 0) -
        (a.completed_at ? Date.parse(a.completed_at) : 0),
    );
  const recent = tickets
    .filter(
      (t) =>
        ["completed", "no_show", "cancelled"].includes(t.status) &&
        (t as Ticket).close_reason !== "queue_cleared",
    )
    .sort((a, b) => sortByJoined(b, a))
    .slice(0, 8);
  const activeCount = waiting.length + serving.length;

  const otherLinesWithPeople = serviceLineStats.filter(
    (line) => line.id !== serviceId && line.waiting + line.serving > 0,
  );

  return (
    <>
      <PageHeader
        title={serviceName}
        subtitle="Serve customers in order — change rules under Settings"
        back="/dashboard/services"
      />

      {serviceLineStats.length > 1 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {serviceLineStats.map((line) => {
            const total = line.waiting + line.serving;
            const active = line.id === serviceId;
            return (
              <Link
                key={line.id}
                href={`/dashboard/services/${line.id}/queue`}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-muted"
                }`}
              >
                {line.name}
                {total > 0 ? ` (${total})` : ""}
              </Link>
            );
          })}
        </div>
      ) : null}

      <BoardTabs tab={tab} setTab={setTab} pendingCount={pendingApproval.length} />

      {tab === "settings" ? (
        <QueueBoardSettings
          serviceId={serviceId}
          providerId={providerId}
          businessName={businessName}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          activeCount={activeCount}
          requiresJoinApproval={requiresJoinApproval}
          approvalQueueOrder={approvalQueueOrder}
          requiresJoinDocuments={requiresJoinDocuments}
          joinDocumentRequirements={joinDocumentRequirements}
          lineChatEnabled={chatEnabled}
          onLineChatEnabledChange={setChatEnabled}
          isOwner={isOwner}
          onCleared={() => {
            setIsPaused(true);
            refreshTickets();
          }}
          onActionDone={notify}
        />
      ) : (
        <div className="mx-auto w-full max-w-7xl pb-24">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_min(20rem,36%)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0 space-y-6">
          {/* Status strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <LiveIndicator
                wsState={wsState}
                isRefreshing={isRefreshing}
                onRefresh={refreshTickets}
              />
              <span className="text-muted">
                <strong className="text-foreground">{waiting.length}</strong> waiting ·{" "}
                <strong className="text-foreground">{serving.length}</strong> being served
              </span>
            </div>
            {isPaused ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                App joins paused
              </span>
            ) : null}
          </div>

          {isPaused ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              New customers cannot join from the app right now. You can still add walk-ins
              and call people forward. Turn joins back on in Settings.
            </p>
          ) : null}

          {waiting.length === 0 &&
          serving.length === 0 &&
          otherLinesWithPeople.length > 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              This line is empty.{" "}
              {otherLinesWithPeople.map((line, i) => (
                <span key={line.id}>
                  {i > 0 ? " · " : ""}
                  <Link
                    href={`/dashboard/services/${line.id}/queue`}
                    className="font-semibold underline"
                  >
                    {line.name}
                  </Link>{" "}
                  ({line.waiting} waiting)
                </span>
              ))}
            </p>
          ) : null}

          {/* Step 1: Call next */}
          <section>
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted">
              Step 1 — Call the next person
            </p>
            <CallNextButton
              serviceId={serviceId}
              waitingCount={waiting.length}
              onActionDone={notify}
            />
          </section>

          {/* Now serving */}
          <section>
            <h2 className="mb-2 text-sm font-semibold">Now serving</h2>
            {serving.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                Nobody at the counter yet. Press Call next when someone is ready.
              </p>
            ) : (
              <ul className="space-y-3">
                {serving.map((t) => (
                  <li
                    key={t.id}
                    className="overflow-hidden rounded-xl border-2 border-emerald-300 bg-background"
                  >
                    <div className="bg-emerald-50 px-4 py-4 text-center">
                      <p className="text-xs font-medium uppercase text-emerald-800">
                        Ticket number
                      </p>
                      <p className="text-4xl font-bold text-emerald-900">#{t.ticket_number}</p>
                      <p className="mt-1 font-semibold">{ticketDisplayName(t)}</p>
                      <TicketContactDetails t={t} />
                    </div>
                    <ServingActions
                      serviceId={serviceId}
                      ticketId={t.id}
                      onActionDone={notify}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pending approvals */}
          {pendingApproval.length > 0 ? (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-indigo-900">
                Needs your OK ({pendingApproval.length})
              </h2>
              <p className="mb-3 text-xs text-muted">
                These people asked to join from the app. Approve to add them to the line.
              </p>
              <ul className="space-y-3">
                {pendingApproval.map((t) => (
                  <PendingApprovalRow
                    key={t.id}
                    t={t}
                    serviceId={serviceId}
                    onActionDone={notify}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {/* Waiting line */}
          <section>
            <h2 className="mb-2 text-sm font-semibold">
              Waiting in line ({waiting.length})
            </h2>
            {waiting.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                No one waiting.
              </p>
            ) : (
              <ul className="space-y-2">
                {waiting.map((t, i) => (
                  <WaitingRow
                    key={t.id}
                    t={t}
                    serviceId={serviceId}
                    position={i + 1}
                    allowVip={allowVip}
                    onActionDone={notify}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-xs font-medium text-muted">Other actions</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <WalkInForm
                  serviceId={serviceId}
                  allowVip={allowVip}
                  onActionDone={notify}
                />
              </div>
              <div className="sm:w-40">
                <RecallButton
                  serviceId={serviceId}
                  lastCompletedTicket={completed[0]}
                  onActionDone={notify}
                />
              </div>
            </div>
          </section>

          {recent.length > 0 ? (
            <details className="rounded-xl border border-border bg-surface px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium select-none">
                Recent finished ({recent.length})
              </summary>
              <ul className="mt-3 space-y-2">
                {recent.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      #{t.ticket_number} {ticketDisplayName(t)}
                    </span>
                    <StatusPill status={t.status} />
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
            </div>

            <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
              <div className="mb-3 lg:mb-4">
                <h2 className="text-sm font-semibold sm:text-base">Line chat</h2>
                <p className="mt-0.5 text-xs text-muted sm:text-sm">
                  Message everyone waiting or being served on this line.
                </p>
              </div>
              <QueueLineChatPanel
                variant="embedded"
                serviceItemId={serviceId}
                providerId={providerId}
                businessName={businessName}
                currentUserId={currentUserId}
                wsClient={client}
                isOwner={isOwner}
                initialChatEnabled={chatEnabled}
              />
            </aside>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </>
  );
}
