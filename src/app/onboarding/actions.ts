"use server";

import { createClient } from "@/lib/supabase/server";
import { geocodeLocation } from "@/lib/weather";
import { estimateCalorieTarget, estimateProteinTarget } from "@/lib/ai/mealPlanner";
import { toList, type OnboardingData } from "@/components/onboarding/types";

export async function saveOnboardingDetailsAction(data: OnboardingData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const location = data.locationName ? await geocodeLocation(data.locationName).catch(() => null) : null;

  const profilePatch = {
    full_name: data.fullName || null,
    age: data.age ? Number(data.age) : null,
    height_cm: data.heightCm ? Number(data.heightCm) : null,
    weight_kg: data.weightKg ? Number(data.weightKg) : null,
    activity_level: data.activityLevel,
    goal: data.goal,
    location_name: location?.name ?? data.locationName ?? null,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    timezone: location?.timezone ?? "Europe/London",
    onboarding_step: 4,
  };

  const target = {
    weight_kg: profilePatch.weight_kg,
    height_cm: profilePatch.height_cm,
    age: profilePatch.age,
    activity_level: profilePatch.activity_level,
    goal: profilePatch.goal,
  };
  const calorieTarget = estimateCalorieTarget(target as never);
  const proteinTarget = estimateProteinTarget(target as never);

  await supabase
    .from("profiles")
    .update({ ...profilePatch, daily_calorie_target: calorieTarget, daily_protein_target: proteinTarget })
    .eq("id", user.id);

  await supabase.from("food_preferences").upsert({
    user_id: user.id,
    weekly_food_budget: data.weeklyFoodBudget ? Number(data.weeklyFoodBudget) : 60,
    favourite_foods: toList(data.favouriteFoods),
    disliked_foods: toList(data.dislikedFoods),
    never_recommend: toList(data.neverRecommend),
    allergies: toList(data.allergies),
    dietary_requirements: toList(data.dietaryRequirements),
    favourite_supermarkets: toList(data.favouriteSupermarkets),
    cooking_ability: data.cookingAbility,
    kitchen_appliances: data.kitchenAppliances,
    preferred_meal_times: data.mealTimes,
    favourite_drinks: toList(data.favouriteDrinks),
    favourite_snacks: toList(data.favouriteSnacks),
  });

  await supabase.from("lifestyle").upsert({
    user_id: user.id,
    wake_time: data.wakeTime,
    bedtime: data.bedtime,
    work_schedule: data.workSchedule || null,
    daily_activity: data.dailyActivity || null,
  });
}

export async function finishOnboardingAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("profiles").update({ onboarding_completed: true, onboarding_step: 5 }).eq("id", user.id);
}
