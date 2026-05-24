"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";
import {
  homePathForUser,
  resolveAppRole,
} from "@/lib/navigation";
import { providerHomePath } from "@/lib/provider-routes";
import { rethrowNavigationError } from "@/lib/rethrow-navigation";
import { listMyProviders } from "@/lib/dal";
import { clearSession, selectProvider, setAppRole, setSessionToken } from "@/lib/session";

export type AuthState =
  | {
      error?: string;
      fields?: { email?: string; full_name?: string };
      success?: boolean;
    }
  | undefined;

type Token = components["schemas"]["Token"];

async function exchangePassword(
  email: string,
  password: string,
): Promise<Token> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  return apiFetch<Token>("/login/access-token", {
    method: "POST",
    body,
    authenticated: false,
  });
}

function emailLooksValid(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!emailLooksValid(email)) {
    return { error: "Enter a valid email.", fields: { email } };
  }
  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      fields: { email },
    };
  }

  try {
    const token = await exchangePassword(email, password);
    await setSessionToken(token.access_token);
    const me = await apiFetch<components["schemas"]["UserPublic"]>("/users/me", {
      method: "GET",
    });
    const role = resolveAppRole(me);
    await setAppRole(role);
    if (role === "provider") {
      const businesses = await listMyProviders();
      if (businesses.length > 0) {
        await selectProvider(businesses[0].id);
      }
      redirect(await providerHomePath());
    }
    redirect(homePathForUser(me));
  } catch (err) {
    rethrowNavigationError(err);
    if (err instanceof ApiRequestError) {
      return {
        error:
          err.status === 400 || err.status === 401
            ? "Wrong email or password."
            : err.detail,
        fields: { email },
      };
    }
    return { error: "Something went wrong. Try again.", fields: { email } };
  }
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim() || undefined;
  const userType = String(formData.get("user_type") ?? "customer");
  const user_type: "customer" | "provider" =
    userType === "provider" ? "provider" : "customer";

  if (!emailLooksValid(email)) {
    return { error: "Enter a valid email.", fields: { email, full_name } };
  }
  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      fields: { email, full_name },
    };
  }

  try {
    await apiFetch("/users/signup", {
      method: "POST",
      authenticated: false,
      body: { email, password, full_name, user_type },
    });
    const token = await exchangePassword(email, password);
    await setSessionToken(token.access_token);
    const me = await apiFetch<components["schemas"]["UserPublic"]>("/users/me", {
      method: "GET",
    });
    const role = resolveAppRole(me);
    await setAppRole(role);
    if (role === "provider") {
      const businesses = await listMyProviders();
      if (businesses.length > 0) {
        await selectProvider(businesses[0].id);
      }
      redirect(await providerHomePath());
    }
    redirect(homePathForUser(me));
  } catch (err) {
    rethrowNavigationError(err);
    if (err instanceof ApiRequestError) {
      return { error: err.detail, fields: { email, full_name } };
    }
    return {
      error: "Something went wrong. Try again.",
      fields: { email, full_name },
    };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  try {
    const email = String(formData.get("email") ?? "").trim();
    console.log("forgotPasswordAction called with email:", email);

    if (!emailLooksValid(email)) {
      return { error: "Enter a valid email.", fields: { email } };
    }

    const encodedEmail = encodeURIComponent(email);
    const path = `/password-recovery/${encodedEmail}`;
    console.log("Calling apiFetch with path:", path);
    const response = await apiFetch<{ message: string }>(path, {
      method: "POST",
      authenticated: false,
    });
    console.log("Password recovery response:", response);
    return { success: true };
  } catch (err) {
    console.error("Error in forgotPasswordAction:", err);
    const email = String(formData.get("email") ?? "").trim();
    if (err instanceof ApiRequestError) {
      return {
        error: err.detail,
        fields: { email },
      };
    }
    return {
      error: "Failed to send recovery email. Try again.",
      fields: { email },
    };
  }
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "Invalid or missing reset token." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Optional: Validate password strength (at least one uppercase, one number, one special char)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password should contain at least one uppercase letter and one number.",
    };
  }

  try {
    await apiFetch<{ message: string }>("/reset-password", {
      method: "POST",
      authenticated: false,
      body: { token, new_password: password },
    });
    redirect(
      "/login?message=Password reset successful. Please log in with your new password.",
    );
  } catch (err) {
    rethrowNavigationError(err);
    if (err instanceof ApiRequestError) {
      return {
        error:
          err.status === 400 || err.status === 401
            ? "Invalid or expired reset link."
            : err.detail,
      };
    }
    return { error: "Failed to reset password. Try again." };
  }
}
