import "server-only";

import { API_URL } from "../env";
import { getSessionToken } from "../session";

export type ApiError = {
  status: number;
  detail: string;
};

export class ApiRequestError extends Error {
  status: number;
  detail: string;
  constructor(err: ApiError) {
    super(err.detail);
    this.status = err.status;
    this.detail = err.detail;
  }
}

/** Fail fast when the API is down instead of hanging for minutes (undici default). */
const API_FETCH_TIMEOUT_MS = 25_000;

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
};

function buildUrl(path: string, query?: FetchOptions["query"]): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<ApiError> {
  let detail = res.statusText || "Request failed";
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (typeof data.detail === "string") {
      detail = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0] as { msg?: string };
      detail = first?.msg ?? detail;
    }
  } catch {
    // body wasn't JSON; keep statusText
  }
  return { status: res.status, detail };
}

export async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const {
    body,
    authenticated = true,
    query,
    headers,
    timeoutMs = API_FETCH_TIMEOUT_MS,
    ...rest
  } = opts;

  const reqHeaders = new Headers(headers);
  if (authenticated) {
    const token = await getSessionToken();
    if (token) reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  let payload: BodyInit | undefined;
  if (body instanceof URLSearchParams || body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    reqHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(`/api/v1${path}`, query), {
      ...rest,
      headers: reqHeaders,
      body: payload,
      cache: rest.cache ?? "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" ||
        err.name === "AbortError" ||
        (err as { code?: string }).code === "UND_ERR_HEADERS_TIMEOUT");
    if (isTimeout) {
      throw new ApiRequestError({
        status: 504,
        detail:
          "API request timed out. Is the backend running at " +
          API_URL +
          "?",
      });
    }
    throw err;
  }

  if (!res.ok) {
    throw new ApiRequestError(await parseError(res));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
