"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ConditionalSeekerShell } from "@/components/layouts/ConditionalSeekerShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PwaViewportFix } from "@/components/PwaViewportFix";
import {
  SeekerNavProvider,
  type SeekerNavSession,
} from "@/lib/seeker-nav-context";

export function Providers({
  children,
  seekerNav,
}: {
  children: React.ReactNode;
  seekerNav: SeekerNavSession;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <SeekerNavProvider value={seekerNav}>
        <PwaViewportFix />
        <ConditionalSeekerShell>{children}</ConditionalSeekerShell>
        <InstallPrompt />
      </SeekerNavProvider>
    </QueryClientProvider>
  );
}
