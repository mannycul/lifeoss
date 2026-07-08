"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UtensilsCrossed, Sparkles, ArrowRight } from "lucide-react";
import type { MealPlanItem } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils";

const MEAL_LABEL: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

export function MealsCard({ items, currency }: { items: MealPlanItem[]; currency: "GBP" | "USD" | "EUR" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    try {
      await fetch("/api/meals/generate", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="animate-fade-in-up sm:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle>Today’s meals</CardTitle>
        <Link href="/meals" className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
          View all <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <UtensilsCrossed className="size-6 text-[var(--muted-2)]" />
            <p className="text-sm text-[var(--muted)]">No plan generated yet for today.</p>
            <Button size="sm" onClick={generate} loading={loading} className="gap-1.5">
              <Sparkles className="size-3.5" /> Generate today’s meals
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone="default">{MEAL_LABEL[item.meal_type]}</Badge>
                    <span className="truncate text-sm">{item.name}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-[var(--muted)]">
                  {item.calories} kcal · {formatCurrency(item.cost, currency)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
