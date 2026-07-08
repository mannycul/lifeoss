"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GlassWater, Plus } from "lucide-react";

export function HydrationCard({ initialMl, goalMl }: { initialMl: number; goalMl: number }) {
  const [ml, setMl] = useState(initialMl);
  const [pending, startTransition] = useTransition();

  function add(amount: number) {
    setMl((v) => v + amount);
    startTransition(async () => {
      await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: amount }),
      });
    });
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Hydration</CardTitle>
        <GlassWater className="size-4 text-[var(--muted)]" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tracking-tight">{(ml / 1000).toFixed(1)}L</span>
          <span className="text-xs text-[var(--muted)]">goal {(goalMl / 1000).toFixed(1)}L</span>
        </div>
        <ProgressBar value={ml} max={goalMl} className="mt-3" tone="accent" />
        <div className="mt-3 flex gap-2">
          {[250, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => add(amount)}
              disabled={pending}
              className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Plus className="size-3" /> {amount}ml
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
