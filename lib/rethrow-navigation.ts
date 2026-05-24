import { isRedirectError } from "next/dist/client/components/redirect-error";

/** `redirect()` throws — must not be caught as a login/API failure. */
export function rethrowNavigationError(err: unknown): void {
  if (isRedirectError(err)) {
    throw err;
  }
}
