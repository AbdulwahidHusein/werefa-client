import { API_URL } from "../env";

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

type Options = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Query;
};

function buildPath(path: string, query?: Query): string {
  const search = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      search.set(k, String(v));
    }
  }
  const qs = search.toString();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/api${clean}${qs ? `?${qs}` : ""}`;
}

export function getWsUrl(path: string, token: string): string {
  const base = API_URL.replace(/^http/, "ws");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}?token=${token}`;
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  } catch {
    // not JSON
  }
  return res.statusText || "Request failed";
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { body, query, headers, ...rest } = opts;
  const reqHeaders = new Headers(headers);
  let payload: BodyInit | undefined;
  if (body instanceof FormData || body instanceof URLSearchParams) {
    payload = body;
  } else if (body !== undefined) {
    reqHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }
  const res = await fetch(buildPath(path, query), {
    ...rest,
    headers: reqHeaders,
    body: payload,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readError(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
