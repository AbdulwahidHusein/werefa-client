"use client";

import { ClearQueueButton } from "./ClearQueueButton";
import { JoinDocumentSettings } from "./JoinDocumentSettings";
import { QueueApprovalSettings } from "./QueueApprovalSettings";
import type { JoinDocumentRequirement } from "@/lib/join-documents";
import { CustomerDirectoryPanel } from "./CustomerDirectoryPanel";
import { GenerateInviteButton } from "./GenerateInviteButton";
import { AccessCodeDisplay } from "@/components/AccessCodeDisplay";
import { QueuePauseToggle } from "@/components/QueuePauseToggle";
import { QueueLineChatPanel } from "@/components/QueueLineChatPanel";

export function QueueBoardSettings({
  serviceId,
  providerId,
  businessName,
  isPaused,
  setIsPaused,
  activeCount,
  requiresJoinApproval,
  approvalQueueOrder,
  requiresJoinDocuments,
  joinDocumentRequirements,
  lineChatEnabled,
  isOwner,
  currentUserId,
  wsClient,
  onCleared,
  onActionDone,
}: {
  serviceId: string;
  providerId: string;
  businessName?: string;
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
  activeCount: number;
  requiresJoinApproval: boolean;
  approvalQueueOrder: "preserve_register_time" | "approval_time";
  requiresJoinDocuments: boolean;
  joinDocumentRequirements: JoinDocumentRequirement[];
  lineChatEnabled: boolean;
  isOwner: boolean;
  currentUserId?: string;
  wsClient: { onMessage: (cb: (msg: unknown) => void) => () => void } | null;
  onCleared: () => void;
  onActionDone: (msg: string, variant?: "ok" | "err") => void;
}) {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="text-base font-semibold">Queue controls</h2>
        <p className="mt-1 text-sm text-muted">
          Use these when you need to stop new joins or reset at end of day. They do not
          delete your history.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-semibold text-muted">Remote joins (app)</p>
            <div className="mt-2">
              <QueuePauseToggle
                providerId={providerId}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Paused = customers cannot join from the app. Walk-ins you add still work.
            </p>
          </div>
          <ClearQueueButton
            serviceId={serviceId}
            activeCount={activeCount}
            onCleared={onCleared}
            onActionDone={onActionDone}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="text-base font-semibold">Private access code</h2>
        <p className="mt-1 text-sm text-muted">
          Customers enter this code to join a private line from the app.
        </p>
        <div className="mt-4">
          <AccessCodeDisplay providerId={providerId} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-muted">Share a join link</p>
          <GenerateInviteButton serviceId={serviceId} />
        </div>
      </section>

      <QueueApprovalSettings
        providerId={providerId}
        serviceId={serviceId}
        requiresJoinApproval={requiresJoinApproval}
        approvalQueueOrder={approvalQueueOrder}
        onActionDone={onActionDone}
      />

      <JoinDocumentSettings
        providerId={providerId}
        serviceId={serviceId}
        initialRequires={requiresJoinDocuments}
        initialRequirements={joinDocumentRequirements}
        onActionDone={onActionDone}
      />

      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="text-base font-semibold">Customers</h2>
        <p className="mt-1 text-sm text-muted">
          View contact details and ban someone from joining your business.
        </p>
        <div className="mt-4">
          <CustomerDirectoryPanel
            serviceId={serviceId}
            providerId={providerId}
            defaultOpen
            onActionDone={onActionDone}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-5">
        <h2 className="text-base font-semibold">Line chat</h2>
        <p className="mt-1 text-sm text-muted">
          Message everyone currently in this queue.
        </p>
        <div className="mt-4">
          <QueueLineChatPanel
            serviceItemId={serviceId}
            providerId={providerId}
            businessName={businessName}
            currentUserId={currentUserId}
            wsClient={wsClient}
            isOwner={isOwner}
            initialChatEnabled={lineChatEnabled}
          />
        </div>
      </section>
    </div>
  );
}
