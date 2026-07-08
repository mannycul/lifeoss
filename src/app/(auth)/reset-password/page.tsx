"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type AuthState } from "../actions";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <div>
      <h1 className="text-lg font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">We’ll email you a link to choose a new one.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>

        {state.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}
        {state.message && <p className="text-xs text-[var(--success)]">{state.message}</p>}

        <Button type="submit" className="w-full" loading={pending}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
