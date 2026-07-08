"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Footprints } from "lucide-react";

export function StepsCard({ initialSteps, goal }: { initialSteps: number; goal: number }) {
  const [steps, setSteps] = useState(initialSteps);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(value: number) {
    setSteps(value);
    setEditing(false);
    startTransition(async () => {
      await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: value }),
      });
    });
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Steps</CardTitle>
        <Footprints className="size-4 text-[var(--muted)]" />
      </CardHeader>
      <CardContent>
        {editing ? (
          <input
            autoFocus
            type="number"
            defaultValue={steps}
            onBlur={(e) => save(Number(e.target.value) || 0)}
            onKeyDown={(e) => e.key === "Enter" && save(Number((e.target as HTMLInputElement).value) || 0)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--surface-2)] px-2 py-1 text-2xl font-semibold tracking-tight outline-none"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-left">
            <span className="text-2xl font-semibold tracking-tight">{steps.toLocaleString()}</span>
          </button>
        )}
        <p className="mb-3 mt-1 text-xs text-[var(--muted)]">goal {goal.toLocaleString()} · {pending ? "saving..." : "tap to edit"}</p>
        <ProgressBar value={steps} max={goal} tone="success" />
      </CardContent>
    </Card>
  );
}
