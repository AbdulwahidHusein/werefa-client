"use server";

import { apiFetch, ApiRequestError } from "@/lib/api/server";
import type { components } from "@/lib/api/schema";

type UserPublic = components["schemas"]["UserPublic"];

export type TestTokenState = 
  | { ok: true; user: UserPublic }
  | { error: string }
  | undefined;

export async function testTokenAction(
  _prev: TestTokenState,
  _fd: FormData,
): Promise<TestTokenState> {
  try {
    const user = await apiFetch<UserPublic>("/login/test-token", {
      method: "POST",
    });
    return { ok: true, user };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: `API Error: ${err.status} - ${err.detail}` };
    }
    return { error: "An unexpected error occurred while testing the token." };
  }
}
