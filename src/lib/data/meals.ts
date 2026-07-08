import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MealPlan, MealPlanItem, Profile, FoodPreferences } from "@/lib/database.types";
import { generateDailyMealPlan } from "@/lib/ai/mealPlanner";
import { getBudgetSummary } from "@/lib/data/budget";
import { todayISO } from "@/lib/utils";

export interface MealPlanWithItems {
  plan: MealPlan;
  items: MealPlanItem[];
}

export async function getTodayMealPlan(supabase: SupabaseClient<Database>, userId: string): Promise<MealPlanWithItems | null> {
  const date = todayISO();
  const { data: plan } = await supabase.from("meal_plans").select("*").eq("user_id", userId).eq("date", date).maybeSingle();
  if (!plan) return null;
  const { data: items } = await supabase
    .from("meal_plan_items")
    .select("*")
    .eq("meal_plan_id", plan.id)
    .order("created_at", { ascending: true });
  return { plan: plan as MealPlan, items: (items ?? []) as MealPlanItem[] };
}

export async function generateAndSaveTodayMealPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: Profile,
  preferences: FoodPreferences
): Promise<MealPlanWithItems> {
  const date = todayISO();

  const [{ data: memory }, { data: pantry }, budget] = await Promise.all([
    supabase.from("ai_memory").select("*").eq("user_id", userId).eq("category", "food"),
    supabase.from("pantry_items").select("*").eq("user_id", userId),
    getBudgetSummary(supabase, userId, preferences.weekly_food_budget),
  ]);

  const meals = await generateDailyMealPlan({
    profile,
    preferences,
    memory: memory ?? [],
    pantry: pantry ?? [],
    budgetRemainingToday: budget.remainingToday,
  });

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      cost: acc.cost + m.cost,
    }),
    { calories: 0, protein: 0, cost: 0 }
  );

  await supabase.from("meal_plans").delete().eq("user_id", userId).eq("date", date);
  const { data: plan } = await supabase
    .from("meal_plans")
    .insert({
      user_id: userId,
      date,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein),
      total_cost: Number(totals.cost.toFixed(2)),
    })
    .select()
    .single();

  if (!plan) throw new Error("Failed to create meal plan");

  const { data: items } = await supabase
    .from("meal_plan_items")
    .insert(
      meals.map((m) => ({
        meal_plan_id: plan.id,
        user_id: userId,
        meal_type: m.meal_type,
        name: m.name,
        ingredients: m.ingredients as unknown as Database["public"]["Tables"]["meal_plan_items"]["Row"]["ingredients"],
        recipe: m.recipe,
        calories: Math.round(m.calories),
        protein: Math.round(m.protein),
        cost: Number(m.cost.toFixed(2)),
        prep_time_minutes: m.prep_time_minutes,
        cook_time_minutes: m.cook_time_minutes,
        is_leftover: m.is_leftover,
      }))
    )
    .select();

  return { plan: plan as MealPlan, items: (items ?? []) as MealPlanItem[] };
}
