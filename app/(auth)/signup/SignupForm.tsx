"use client";

import { useActionState, useState } from "react";

import { signupAction, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const initial: AuthState = undefined;

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initial);
  const [userType, setUserType] = useState<"customer" | "provider">("customer");

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Full name"
        name="full_name"
        type="text"
        autoComplete="name"
        defaultValue={state?.fields?.full_name}
        placeholder="Jane Doe"
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.fields?.email}
        placeholder="you@example.com"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="At least 8 characters"
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          I am a…
        </span>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(
            [
              ["customer", "Customer"],
              ["provider", "Business"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => setUserType(value)}
              className={`flex h-10 flex-1 items-center justify-center rounded-md text-sm font-medium ${
                userType === value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={userType === value}
            >
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" name="user_type" value={userType} />
      </div>

      {state?.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
