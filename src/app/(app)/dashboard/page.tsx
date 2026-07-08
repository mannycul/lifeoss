import { createClient } from "@/lib/supabase/server";
import { getTodayWeather } from "@/lib/data/weather";
import { getOrCreateTodayOutfit } from "@/lib/data/outfit";
import { getTodayMealPlan } from "@/lib/data/meals";
import { getBudgetSummary } from "@/lib/data/budget";
import { getWeeklyShoppingList } from "@/lib/data/shopping";
import { todayISO, addDaysISO } from "@/lib/utils";
import { estimateCalorieTarget, estimateProteinTarget } from "@/lib/ai/mealPlanner";
import type { Profile, FoodPreferences } from "@/lib/database.types";

import { GreetingHero } from "@/components/dashboard/GreetingHero";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { OutfitCard } from "@/components/dashboard/OutfitCard";
import { MealsCard } from "@/components/dashboard/MealsCard";
import { MacrosCard } from "@/components/dashboard/MacrosCard";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { SpendingCard } from "@/components/dashboard/SpendingCard";
import { ShoppingReminderCard } from "@/components/dashboard/ShoppingReminderCard";
import { HydrationCard } from "@/components/dashboard/HydrationCard";
import { StepsCard } from "@/components/dashboard/StepsCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profileRow }, { data: preferencesRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("food_preferences").select("*").eq("user_id", user.id).single(),
  ]);
  const profile = profileRow as Profile;
  const preferences = preferencesRow as FoodPreferences | null;

  const date = todayISO();

  const [weather, mealPlan, budget, shoppingList, { data: waterRows }, { data: stepRow }, { data: spendRows }, { data: pantry }] =
    await Promise.all([
      getTodayWeather(supabase, profile),
      getTodayMealPlan(supabase, user.id),
      getBudgetSummary(supabase, user.id, preferences?.weekly_food_budget ?? 60),
      getWeeklyShoppingList(supabase, user.id),
      supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).eq("logged_at", date),
      supabase.from("step_logs").select("steps").eq("user_id", user.id).eq("logged_at", date).maybeSingle(),
      supabase.from("spending_log").select("amount").eq("user_id", user.id).eq("date", date),
      supabase.from("pantry_items").select("expiry_date").eq("user_id", user.id),
    ]);

  const outfit = await getOrCreateTodayOutfit(supabase, user.id, weather);

  const calorieTarget = profile.daily_calorie_target ?? estimateCalorieTarget(profile);
  const proteinTarget = profile.daily_protein_target ?? estimateProteinTarget(profile);
  const waterMl = (waterRows ?? []).reduce((sum, r) => sum + r.amount_ml, 0);
  const todaySpend =
    (spendRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0) + (mealPlan?.plan.total_cost ?? 0);
  const shoppingRemaining = shoppingList.filter((i) => !i.checked).length;
  const in7Days = addDaysISO(7);
  const expiringSoon = (pantry ?? []).filter((p) => p.expiry_date && p.expiry_date <= in7Days).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <GreetingHero name={profile.full_name || "there"} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WeatherCard weather={weather} locationName={profile.location_name} />
        <MacrosCard calories={mealPlan?.plan.total_calories ?? 0} calorieTarget={calorieTarget} protein={mealPlan?.plan.total_protein ?? 0} proteinTarget={proteinTarget} />
        <BudgetCard budget={budget} currency={profile.currency} />
        <SpendingCard todaySpend={todaySpend} currency={profile.currency} />

        <OutfitCard outfit={outfit} />
        <MealsCard items={mealPlan?.items ?? []} currency={profile.currency} />

        <ShoppingReminderCard remaining={shoppingRemaining} expiringSoon={expiringSoon} />
        <HydrationCard initialMl={waterMl} goalMl={profile.water_goal_ml} />
        <StepsCard initialSteps={stepRow?.steps ?? 0} goal={profile.step_goal} />
      </div>
    </div>
  );
}
