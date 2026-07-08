"use client";

import { useState } from "react";
import { ChefHat, Clock, Flame, Beef, ThumbsUp, ThumbsDown, Recycle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { MealPlanItem, Currency } from "@/lib/database.types";

const MEAL_LABEL: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

export function MealDetailCard({ item, currency }: { item: MealPlanItem; currency: Currency }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(item.liked);
  const [sending, setSending] = useState(false);

  async function feedback(value: boolean) {
    setLiked(value);
    setSending(true);
    try {
      await fetch("/api/meals/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, liked: value, ingredientNames: item.ingredients.map((i) => i.name) }),
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Badge tone="accent">{MEAL_LABEL[item.meal_type]}</Badge>
            {item.is_leftover && (
              <Badge tone="default" className="gap-1">
                <Recycle className="size-3" /> Leftovers
              </Badge>
            )}
          </div>
          <h3 className="text-base font-medium">{item.name}</h3>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => feedback(true)}
            disabled={sending}
            className={`flex size-7 items-center justify-center rounded-full border transition-colors ${liked === true ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            <ThumbsUp className="size-3.5" />
          </button>
          <button
            onClick={() => feedback(false)}
            disabled={sending}
            className={`flex size-7 items-center justify-center rounded-full border transition-colors ${liked === false ? "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            <ThumbsDown className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <Flame className="size-3.5" /> {item.calories} kcal
        </span>
        <span className="flex items-center gap-1.5">
          <Beef className="size-3.5" /> {item.protein}g protein
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {item.prep_time_minutes + item.cook_time_minutes} min
        </span>
        <span>{formatCurrency(item.cost, currency)}</span>
      </div>

      <button onClick={() => setOpen((v) => !v)} className="mt-3 flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline">
        <ChefHat className="size-3.5" /> {open ? "Hide recipe" : "Show ingredients & recipe"}
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-4 border-t border-[var(--border)] pt-3 sm:grid-cols-2">
          <div>
            <h4 className="mb-1.5 text-xs font-medium text-[var(--muted)]">Ingredients</h4>
            <ul className="space-y-1 text-sm">
              {item.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between text-[var(--foreground)]/90">
                  <span>{ing.name}</span>
                  <span className="text-[var(--muted)]">{ing.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-1.5 text-xs font-medium text-[var(--muted)]">Recipe</h4>
            <p className="text-sm leading-6 text-[var(--foreground)]/90">{item.recipe}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Prep {item.prep_time_minutes} min · Cook {item.cook_time_minutes} min
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
