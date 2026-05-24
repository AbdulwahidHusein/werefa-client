"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { rememberActiveServiceAction } from "@/app/dashboard/actions";

/** Saves active service id to a cookie via Server Action (required by Next.js). */
export function RememberActiveService({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const saved = useRef<string | null>(null);

  useEffect(() => {
    if (saved.current === serviceId) return;
    saved.current = serviceId;
    void rememberActiveServiceAction(serviceId).then(() => {
      router.refresh();
    });
  }, [serviceId, router]);

  return null;
}
