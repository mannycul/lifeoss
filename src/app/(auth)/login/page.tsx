"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthState } from "../actions";
import { Label, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthState = {};

function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/reset-password" className="mb-1.5 text-xs text-[var(--accent)] hover:underline">
            Forgot?
          </Link>
        </div>
        <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
      </div>

      {state.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}

      <Button type="submit" className="w-full" loading={pending}>
        Log in
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Log in to your LifeOS.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--accent)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
