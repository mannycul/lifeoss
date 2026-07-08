import { createClient } from "@/lib/supabase/server";
import { getTodayMealPlan } from "@/lib/data/meals";
import { getWeekStart } from "@/lib/data/budget";
import { MealDetailCard } from "@/components/meals/MealDetailCard";
import { GenerateMealsButton } from "@/components/meals/GenerateMealsButton";
import { WeeklyMealStrip } from "@/components/meals/WeeklyMealStrip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

export default async function MealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const mealPlan = await getTodayMealPlan(supabase, user.id);

  const weekStart = getWeekStart();
  const { data: weekPlans } = await supabase
    .from("meal_plans")
    .select("date, total_calories")
    .eq("user_id", user.id)
    .gte("date", weekStart);
  const planByDate = new Map((weekPlans ?? []).map((p) => [p.date, p]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    const plan = planByDate.get(date);
    return { date, hasPlan: !!plan, totalCalories: plan?.total_calories ?? 0 };
  });

  const currency = (profile as Profile | null)?.currency ?? "GBP";

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meals</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Your plan for today, built around your goals and budget.</p>
        </div>
        <GenerateMealsButton label={mealPlan ? "Regenerate" : "Generate today's meals"} />
      </div>

      <div className="mb-6">
        <WeeklyMealStrip days={days} />
      </div>

      {mealPlan && mealPlan.items.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily totals</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6 text-sm">
            <div>
              <div className="text-lg font-semibold">{mealPlan.plan.total_calories}</div>
              <div className="text-xs text-[var(--muted)]">kcal</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{mealPlan.plan.total_protein}g</div>
              <div className="text-xs text-[var(--muted)]">protein</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatCurrency(mealPlan.plan.total_cost, currency)}</div>
              <div className="text-xs text-[var(--muted)]">estimated spend</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {mealPlan?.items.length ? (
          mealPlan.items.map((item) => <MealDetailCard key={item.id} item={item} currency={currency} />)
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-[var(--muted)]">No meals generated for today yet.</p>
              <GenerateMealsButton />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
