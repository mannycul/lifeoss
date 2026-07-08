import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDailySummary } from "@/lib/ai/summary";
import { getTodayWeather } from "@/lib/data/weather";
import { getTodayMealPlan } from "@/lib/data/meals";
import { getBudgetSummary } from "@/lib/data/budget";
import { todayISO } from "@/lib/utils";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = todayISO();
  const { data: existing } = await supabase.from("daily_summaries").select("*").eq("user_id", user.id).eq("date", date).maybeSingle();
  if (existing) return NextResponse.json({ summary: existing.summary });

  const [{ data: profile }, { data: preferences }, { data: outfit }, { data: water }, { data: steps }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("food_preferences").select("weekly_food_budget").eq("user_id", user.id).single(),
    supabase.from("outfit_recommendations").select("reasoning").eq("user_id", user.id).eq("date", date).maybeSingle(),
    supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).eq("logged_at", date),
    supabase.from("step_logs").select("steps").eq("user_id", user.id).eq("logged_at", date).maybeSingle(),
  ]);

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

  const [weather, mealPlan, budget] = await Promise.all([
    getTodayWeather(supabase, profile),
    getTodayMealPlan(supabase, user.id),
    getBudgetSummary(supabase, user.id, preferences?.weekly_food_budget ?? 60),
  ]);

  const summary = await generateDailySummary({
    name: profile.full_name || "there",
    weather,
    outfitReasoning: outfit?.reasoning ?? null,
    mealCount: mealPlan?.items.length ?? 0,
    totalCalories: mealPlan?.plan.total_calories ?? 0,
    totalProtein: mealPlan?.plan.total_protein ?? 0,
    calorieTarget: profile.daily_calorie_target,
    spent: budget.spent,
    budgetRemaining: budget.remaining,
    waterMl: (water ?? []).reduce((s, w) => s + w.amount_ml, 0),
    waterGoalMl: profile.water_goal_ml,
    steps: steps?.steps ?? 0,
    stepGoal: profile.step_goal,
  });

  await supabase.from("daily_summaries").insert({ user_id: user.id, date, summary });

  return NextResponse.json({ summary });
}
