"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { greetingForHour, formatDate } from "@/lib/utils";

export function GreetingHero({ name }: { name: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const firstName = name.split(" ")[0] || name;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/summary", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSummary(data.summary ?? null);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="animate-fade-in-up mb-2">
      <p className="text-xs text-[var(--muted)]">{formatDate(new Date())}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        {greetingForHour(new Date().getHours())}, {firstName}.
      </h1>
      <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--muted)]">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" />
        {loading ? "Putting today's summary together..." : summary}
      </p>
    </div>
  );
}
