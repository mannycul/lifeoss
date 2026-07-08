"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { WeightChart } from "./WeightChart";
import type { WeightLog } from "@/lib/database.types";

export function WeightTracker({ logs, units }: { logs: WeightLog[]; units: "metric" | "imperial" }) {
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const unitLabel = units === "metric" ? "kg" : "lb";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(weight);
    if (!value) return;
    setLoading(true);
    try {
      await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: units === "metric" ? value : value / 2.2046 }),
      });
      setWeight("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const data = [...logs]
    .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
    .map((l) => ({ date: l.logged_at, weight: units === "metric" ? l.weight_kg : Math.round(l.weight_kg * 2.2046 * 10) / 10 }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight</CardTitle>
      </CardHeader>
      <CardContent>
        <WeightChart data={data} unitLabel={unitLabel} />
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <Input type="number" step={0.1} placeholder={`Today's weight (${unitLabel})`} value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Button type="submit" size="md" loading={loading}>
            Log
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
