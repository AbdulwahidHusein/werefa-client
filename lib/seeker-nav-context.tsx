"use client";

import { createContext, useContext } from "react";

import type { AppRole } from "@/lib/navigation";

export type SeekerNavSession = {
  /** Set from httpOnly session + role cookie on the server (login). */
  hasSession: boolean;
  role: AppRole | null;
};

const SeekerNavContext = createContext<SeekerNavSession>({
  hasSession: false,
  role: null,
});

export function SeekerNavProvider({
  value,
  children,
}: {
  value: SeekerNavSession;
  children: React.ReactNode;
}) {
  return (
    <SeekerNavContext.Provider value={value}>{children}</SeekerNavContext.Provider>
  );
}

export function useSeekerNavSession(): SeekerNavSession {
  return useContext(SeekerNavContext);
}
