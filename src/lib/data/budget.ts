import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface BudgetSummary {
  weekStart: string;
  weeklyBudget: number;
  spent: number;
  remaining: number;
  averageDailySpend: number;
  daysElapsed: number;
  daysRemaining: number;
  projectedWeeklySpend: number;
  onTrack: boolean;
  remainingToday: number;
}

/** Monday-start week, matching UK grocery-budget conventions. */
export function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function getBudgetSummary(
  supabase: SupabaseClient<Database>,
  userId: string,
  weeklyBudget: number
): Promise<BudgetSummary> {
  const weekStart = getWeekStart();
  const { data: rows } = await supabase
    .from("spending_log")
    .select("amount")
    .eq("user_id", userId)
    .gte("date", weekStart);

  const spent = (rows ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const daysElapsed = Math.floor((Date.now() - new Date(weekStart).getTime()) / 86_400_000) + 1;
  const daysRemaining = Math.max(7 - daysElapsed, 1);
  const remaining = Math.max(weeklyBudget - spent, 0);
  const averageDailySpend = spent / Math.max(daysElapsed, 1);
  const projectedWeeklySpend = averageDailySpend * 7;

  return {
    weekStart,
    weeklyBudget,
    spent,
    remaining,
    averageDailySpend,
    daysElapsed,
    daysRemaining,
    projectedWeeklySpend,
    onTrack: projectedWeeklySpend <= weeklyBudget,
    remainingToday: remaining / daysRemaining,
  };
}
