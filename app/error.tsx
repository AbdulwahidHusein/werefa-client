"use client";

import { useEffect } from "react";

import { StatusScreen } from "@/components/StatusScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isOffline =
    error.message.toLowerCase().includes("fetch") ||
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("failed to fetch");

  return (
    <StatusScreen
      variant={isOffline ? "offline" : "error"}
      title={isOffline ? "Connection problem" : "Something went wrong"}
      message={
        isOffline
          ? "We couldn't reach the server. Check your internet connection and try again."
          : "An unexpected error occurred. You can retry or return to the home page."
      }
      primaryAction={{ label: "Try again", onClick: reset }}
      secondaryAction={{ label: "Go to Discover", href: "/" }}
    />
  );
}
