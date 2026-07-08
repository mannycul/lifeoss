import { createClient } from "@/lib/supabase/server";
import { getBudgetSummary, getWeekStart } from "@/lib/data/budget";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { SpendingChart } from "@/components/budget/SpendingChart";
import { AddSpendingForm } from "@/components/budget/AddSpendingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

export default async function BudgetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("food_preferences").select("weekly_food_budget").eq("user_id", user.id).single(),
  ]);

  const weeklyBudget = preferences?.weekly_food_budget ?? 60;
  const budget = await getBudgetSummary(supabase, user.id, weeklyBudget);
  const currency = (profile as Profile).currency;

  const weekStart = getWeekStart();
  const [{ data: spendRows }, { data: mealPlans }] = await Promise.all([
    supabase.from("spending_log").select("*").eq("user_id", user.id).gte("date", weekStart).order("date", { ascending: false }),
    supabase.from("meal_plans").select("date, total_cost").eq("user_id", user.id).gte("date", weekStart),
  ]);

  const spendByDate = new Map<string, number>();
  for (const row of spendRows ?? []) spendByDate.set(row.date, (spendByDate.get(row.date) ?? 0) + Number(row.amount));
  for (const plan of mealPlans ?? []) spendByDate.set(plan.date, (spendByDate.get(plan.date) ?? 0) + Number(plan.total_cost));

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString("en-GB", { weekday: "short" }), amount: spendByDate.get(date) ?? 0 };
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Weekly food spending, tracked against your target.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BudgetCard budget={budget} currency={currency} />
        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-lg font-semibold">{formatCurrency(budget.spent, currency)}</div>
              <div className="text-xs text-[var(--muted)]">spent so far</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatCurrency(budget.projectedWeeklySpend, currency)}</div>
              <div className="text-xs text-[var(--muted)]">projected total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily spend vs target</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingChart data={chartData} dailyTarget={weeklyBudget / 7} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log a spend</CardTitle>
        </CardHeader>
        <CardContent>
          <AddSpendingForm />
          <ul className="mt-5 divide-y divide-[var(--border)]">
            {(spendRows ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <div>{row.description || "Spend"}</div>
                  <div className="text-xs text-[var(--muted)]">{new Date(row.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</div>
                </div>
                <span className="font-medium">{formatCurrency(Number(row.amount), currency)}</span>
              </li>
            ))}
            {!spendRows?.length && <li className="py-2.5 text-sm text-[var(--muted)]">No manual spending logged yet this week.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
