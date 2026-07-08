import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { OnboardingData } from "@/components/onboarding/types";
import { defaultOnboardingData } from "@/components/onboarding/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: foodPrefs }, { data: lifestyle }, { data: wardrobeItems }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("food_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("lifestyle").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("wardrobe_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (profile?.onboarding_completed) redirect("/dashboard");

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
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 sm:py-16">
      <OnboardingWizard initialData={initialData} wardrobeItems={wardrobeItems ?? []} />
    </div>
  );
}
