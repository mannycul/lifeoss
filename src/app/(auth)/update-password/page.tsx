"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthState } from "../actions";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthState = {};

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <div>
      <h1 className="text-lg font-semibold">Choose a new password</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Make it something you haven’t used before.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
        </div>

        {state.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}

        <Button type="submit" className="w-full" loading={pending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
