"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthState } from "../actions";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div>
      <h1 className="text-lg font-semibold">Create your LifeOS</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">A couple of minutes to set up, then it runs itself.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="fullName">Name</Label>
          <Input id="fullName" name="fullName" type="text" placeholder="Manny" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="At least 8 characters" required autoComplete="new-password" minLength={8} />
        </div>

        {state.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}
        {state.message && <p className="text-xs text-[var(--success)]">{state.message}</p>}

        <Button type="submit" className="w-full" loading={pending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
