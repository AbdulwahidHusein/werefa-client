"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: "#ffffff",
          color: "#09090b",
        }}
      >
        <main
          style={{
            maxWidth: "22rem",
            margin: "0 auto",
            padding: "4rem 1.25rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#52525b", lineHeight: 1.5, margin: 0 }}>
            Werefa hit an unexpected error. Please try again.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: "3rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#18181b",
                color: "#fafafa",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                fontSize: "0.875rem",
                color: "#52525b",
                textDecoration: "none",
              }}
            >
              Go to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
