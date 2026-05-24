/** Client-safe helpers for queue server action results (not a server module). */

export type QueueActionState =
  | { ok: true; message: string }
  | { error: string }
  | undefined;

export function isQueueActionOk(
  res: QueueActionState,
): res is { ok: true; message: string } {
  return res !== undefined && "ok" in res && res.ok;
}

export function queueActionError(
  res: QueueActionState,
  fallback = "Failed.",
): string {
  if (res !== undefined && "error" in res) return res.error;
  return fallback;
}
