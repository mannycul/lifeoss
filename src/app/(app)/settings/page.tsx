import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { defaultOnboardingData, type OnboardingData } from "@/components/onboarding/types";
import type { Profile } from "@/lib/database.types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: foodPrefs }, { data: lifestyle }, { data: memory }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("food_preferences").select("*").eq("user_id", user.id).single(),
    supabase.from("lifestyle").select("*").eq("user_id", user.id).single(),
    supabase.from("ai_memory").select("*").eq("user_id", user.id),
  ]);

  const initialData: Partial<OnboardingData> = {
    fullName: profile?.full_name ?? "",
    age: profile?.age?.toString() ?? "",
    heightCm: profile?.height_cm?.toString() ?? "",
    weightKg: profile?.weight_kg?.toString() ?? "",
    activityLevel: profile?.activity_level ?? defaultOnboardingData.activityLevel,
    goal: profile?.goal ?? defaultOnboardingData.goal,
    locationName: profile?.location_name ?? defaultOnboardingData.locationName,
    weeklyFoodBudget: foodPrefs?.weekly_food_budget?.toString() ?? defaultOnboardingData.weeklyFoodBudget,
    favouriteFoods: foodPrefs?.favourite_foods?.join(", ") ?? "",
    dislikedFoods: foodPrefs?.disliked_foods?.join(", ") ?? "",
    neverRecommend: foodPrefs?.never_recommend?.join(", ") ?? "",
    allergies: foodPrefs?.allergies?.join(", ") ?? "",
    dietaryRequirements: foodPrefs?.dietary_requirements?.join(", ") ?? "",
    favouriteSupermarkets: foodPrefs?.favourite_supermarkets?.join(", ") ?? "",
    cookingAbility: foodPrefs?.cooking_ability ?? defaultOnboardingData.cookingAbility,
    kitchenAppliances: foodPrefs?.kitchen_appliances ?? defaultOnboardingData.kitchenAppliances,
    mealTimes: foodPrefs?.preferred_meal_times ?? defaultOnboardingData.mealTimes,
    favouriteDrinks: foodPrefs?.favourite_drinks?.join(", ") ?? "",
    favouriteSnacks: foodPrefs?.favourite_snacks?.join(", ") ?? "",
    wakeTime: lifestyle?.wake_time?.slice(0, 5) ?? defaultOnboardingData.wakeTime,
    bedtime: lifestyle?.bedtime?.slice(0, 5) ?? defaultOnboardingData.bedtime,
    workSchedule: lifestyle?.work_schedule ?? "",
    dailyActivity: lifestyle?.daily_activity ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Update anything from your onboarding, any time.</p>
      </div>
      <SettingsForm initialData={initialData} profile={profile as Profile} memory={memory ?? []} />
    </div>
  );
}
