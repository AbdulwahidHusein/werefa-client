"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiRequestError } from "@/lib/api/server";
import { requireMe } from "@/lib/dal";

export type ProfileState = { error?: string; success?: boolean } | undefined;
export type PasswordState = { error?: string; success?: boolean } | undefined;
export type ImageUploadState = { error?: string; success?: boolean } | undefined;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+\d{7,15}$/;

export async function uploadUserProfileImageAction(
  _prev: ImageUploadState,
  formData: FormData,
): Promise<ImageUploadState> {
  await requireMe();
  const file = formData.get("file") as File | null;
  if (!file?.size) {
    return { error: "Please choose an image." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be 5MB or smaller." };
  }
  if (!IMAGE_TYPES.includes(file.type)) {
    return { error: "Use JPEG, PNG, or WebP." };
  }

  const body = new FormData();
  body.append("file", file);

  try {
    await apiFetch("/users/me/profile-image", { method: "POST", body });
    revalidatePath("/account");
    revalidatePath("/account/edit");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.detail || "Upload failed." };
    }
    return { error: "Upload failed. Try again." };
  }
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  await requireMe();

  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone_number = String(formData.get("phone_number") ?? "").trim();

  if (full_name && (full_name.length < 2 || full_name.length > 100)) {
    return { error: "Full name must be between 2 and 100 characters." };
  }

  if (!email) {
    return { error: "Email is required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (phone_number && !PHONE_RE.test(phone_number)) {
    return { error: "Phone number must be in international format (e.g. +1234567890)." };
  }

  try {
    await apiFetch("/users/me", {
      method: "PATCH",
      body: {
        full_name: full_name || null,
        email,
        phone_number: phone_number || null,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/edit");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.detail && err.detail.toLowerCase().includes("email already in use")) {
        return { error: "Email already in use." };
      }
      return { error: err.detail || "Failed to update profile." };
    }
    return { error: "An unexpected error occurred. Try again." };
  }
}

export async function updatePasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  await requireMe();

  const current_password = String(formData.get("current_password") ?? "");
  const new_password = String(formData.get("new_password") ?? "");
  const confirm_password = String(formData.get("confirm_password") ?? "");

  if (!current_password) {
    return { error: "Current password is required." };
  }
  if (new_password.length < 8) {
    return { error: "New password must be at least 8 characters long." };
  }
  if (new_password === current_password) {
    return { error: "New password cannot be the same as current password." };
  }
  if (new_password !== confirm_password) {
    return { error: "Passwords do not match." };
  }

  try {
    await apiFetch("/users/me/password", {
      method: "PATCH",
      body: {
        current_password,
        new_password,
      },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.detail && err.detail.toLowerCase().includes("incorrect password")) {
        return { error: "Current password incorrect." };
      }
      if (err.detail && err.detail.toLowerCase().includes("cannot be the same")) {
        return { error: "New password cannot be the same as current password." };
      }
      return { error: err.detail || "Failed to update password." };
    }
    return { error: "An unexpected error occurred. Try again." };
  }
}
