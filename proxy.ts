import { NextResponse, type NextRequest } from "next/server";

import {
  APP_ROLE_COOKIE,
  PROVIDER_ID_COOKIE,
  SERVICE_ID_COOKIE,
  SESSION_COOKIE,
} from "./lib/env";
import { homePathForRole, type AppRole } from "./lib/navigation";

const PROTECTED_PREFIXES = [
  "/me",
  "/ticket",
  "/dashboard",
  "/admin",
  "/account",
];
const AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

function isAuthPath(pathname: string): boolean {
  if (AUTH_PATHS.has(pathname)) return true;
  return pathname.startsWith("/login/") || pathname.startsWith("/otp");
}

function clearAuthCookies(res: NextResponse): void {
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(PROVIDER_ID_COOKIE);
  res.cookies.delete(SERVICE_ID_COOKIE);
  res.cookies.delete(APP_ROLE_COOKIE);
}

function readRole(req: NextRequest): AppRole | null {
  const value = req.cookies.get(APP_ROLE_COOKIE)?.value;
  if (value === "seeker" || value === "provider" || value === "admin") {
    return value;
  }
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && req.nextUrl.searchParams.get("session") === "expired") {
    const res = NextResponse.next();
    clearAuthCookies(res);
    return res;
  }

  if (isAuthPath(pathname) && hasSession) {
    const role = readRole(req);
    const url = req.nextUrl.clone();
    url.pathname = role ? homePathForRole(role) : "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname.startsWith("/admin")) {
    const role = readRole(req);
    if (role && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = homePathForRole(role);
      return NextResponse.redirect(url);
    }
  }

  if (hasSession && pathname.startsWith("/dashboard")) {
    const role = readRole(req);
    if (role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (role === "seeker") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|manifest.webmanifest|sw\\.js|brand/|api).*)",
  ],
};
