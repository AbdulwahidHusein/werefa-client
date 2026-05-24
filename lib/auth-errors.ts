import { ApiRequestError } from "./api/server";

/** Auth failures that mean the browser session cookie should be cleared. */
export function isInvalidSessionError(err: unknown): boolean {
  if (!(err instanceof ApiRequestError)) return false;
  const detail = err.detail.toLowerCase();

  if (err.status === 401) return true;

  // Valid JWT but user row missing (common after DB reseed) or deactivated.
  if (err.status === 404 && detail.includes("user not found")) return true;
  if (err.status === 400 && detail.includes("inactive user")) return true;

  if (err.status === 403) {
    return (
      detail.includes("could not validate credentials") ||
      detail.includes("not authenticated") ||
      detail.includes("invalid authentication")
    );
  }
  return false;
}
