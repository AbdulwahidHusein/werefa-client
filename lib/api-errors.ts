/** Normalize FastAPI error `detail` shapes into a single string. */
export function parseApiDetail(detail: unknown, fallback = "Something went wrong"): string {
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    if (typeof first?.msg === "string" && first.msg.trim()) return first.msg.trim();
  }
  if (detail && typeof detail === "object") {
    const obj = detail as { message?: string; detail?: string };
    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message.trim();
    }
    if (typeof obj.detail === "string" && obj.detail.trim()) {
      return obj.detail.trim();
    }
  }
  return fallback;
}

/** User-facing copy for queue join failures. */
export function friendlyJoinError(detail: unknown, status?: number): string {
  const raw = parseApiDetail(detail);
  const d = raw.toLowerCase();

  if (status === 401 || d.includes("not authenticated") || d.includes("credentials")) {
    return "Please log in again to join the queue.";
  }
  if (status === 403 && d.includes("blocked")) {
    return raw;
  }
  if (d.includes("too far") || d.includes("join distance") || d.includes("geofence")) {
    return "You're too far from this business to join remotely. Move closer and try again.";
  }
  if (d.includes("active ticket")) {
    return "You already have an active line somewhere. Finish or leave that queue before joining another.";
  }
  if (d.includes("access code") || d.includes("invalid or missing access")) {
    return "That access code isn't valid. Check the code and try again.";
  }
  if (d.includes("not accepting remote") || d.includes("joins paused")) {
    return "This line isn't accepting app joins right now. Try again later or visit in person.";
  }
  if (d.includes("currently closed") || d.includes("provider is closed")) {
    return "This business is closed right now.";
  }
  if (d.includes("not active") || d.includes("service is not")) {
    return "This service isn't available right now.";
  }
  if (d.includes("required documents") || d.includes("upload all required")) {
    return "Please upload all required documents before joining.";
  }
  if (d.includes("location") && d.includes("incomplete")) {
    return "We couldn't read your location. Enable location access and try again.";
  }
  if (status === 404 || d.includes("not found")) {
    return "This queue is no longer available.";
  }
  if (status === 429) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (status === 504 || d.includes("timed out")) {
    return "The server took too long to respond. Check your connection and try again.";
  }
  if (status && status >= 500) {
    return "Something went wrong on our side. Please try again in a moment.";
  }
  return raw;
}
