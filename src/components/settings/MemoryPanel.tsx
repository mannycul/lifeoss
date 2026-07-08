"use client";

import { useTransition } from "react";
import { Brain, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { forgetMemoryAction } from "@/app/(app)/settings/actions";
import type { AiMemoryEntry } from "@/lib/database.types";

const TONE = { liked: "success", disliked: "danger", ignored: "default" } as const;

export function MemoryPanel({ entries }: { entries: AiMemoryEntry[] }) {
  const [, startTransition] = useTransition();

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Brain className="size-6 text-[var(--muted-2)]" />
        <p className="text-sm text-[var(--muted)]">
          LifeOS hasn’t learned anything yet. Like/dislike meals and swap outfit pieces to teach it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-lg font-semibold">What LifeOS has learned</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Built from your feedback on meals and outfits. Stronger patterns show a higher weight.
        </p>
      </div>
      <ul className="mt-4 divide-y divide-[var(--border)]">
        {entries
          .sort((a, b) => b.weight - a.weight)
          .map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-2">
                <Badge tone={TONE[entry.sentiment]} className="capitalize">
                  {entry.sentiment}
                </Badge>
                <span className="text-sm capitalize">{entry.key}</span>
                <span className="text-xs text-[var(--muted-2)]">· {entry.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)]">×{entry.weight}</span>
                <button
                  onClick={() => startTransition(() => forgetMemoryAction(entry.id))}
                  className="text-[var(--muted-2)] hover:text-[var(--danger)]"
                  title="Forget"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
