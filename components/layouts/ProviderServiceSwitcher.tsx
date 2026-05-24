"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { openQueueForServiceAction } from "@/app/dashboard/actions";

type ServiceOption = { id: string; name: string };

export function ProviderServiceSwitcher({
  services,
  currentServiceId,
}: {
  services: ServiceOption[];
  currentServiceId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (services.length <= 1) {
    return null;
  }

  return (
    <label className="hidden items-center gap-2 sm:flex">
      <span className="text-xs font-medium text-muted">Queue</span>
      <select
        className="h-9 max-w-[220px] truncate rounded-lg border border-border bg-background px-2 text-sm"
        value={currentServiceId ?? services[0]?.id ?? ""}
        disabled={pending}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return;
          startTransition(async () => {
            await openQueueForServiceAction(id);
            router.refresh();
          });
        }}
      >
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
