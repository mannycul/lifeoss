import type { ActivityLevel, CookingAbility, Goal, MealType } from "@/lib/database.types";

export interface OnboardingData {
  fullName: string;
  age: string;
  heightCm: string;
  weightKg: string;
  activityLevel: ActivityLevel;
  goal: Goal;
  locationName: string;

  weeklyFoodBudget: string;
  favouriteFoods: string;
  dislikedFoods: string;
  neverRecommend: string;
  allergies: string;
  dietaryRequirements: string;
  favouriteSupermarkets: string;
  cookingAbility: CookingAbility;
  kitchenAppliances: string[];
  mealTimes: Record<MealType, string>;
  favouriteDrinks: string;
  favouriteSnacks: string;

  wakeTime: string;
  bedtime: string;
  workSchedule: string;
  dailyActivity: string;
}

export const APPLIANCE_OPTIONS = [
  "Oven",
  "Hob",
  "Microwave",
  "Air fryer",
  "Slow cooker",
  "Blender",
  "Toaster",
  "Grill",
  "Rice cooker",
];

export const defaultOnboardingData: OnboardingData = {
  fullName: "",
  age: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "moderate",
  goal: "maintain",
  locationName: "London, UK",

  weeklyFoodBudget: "60",
  favouriteFoods: "",
  dislikedFoods: "",
  neverRecommend: "",
  allergies: "",
  dietaryRequirements: "",
  favouriteSupermarkets: "",
  cookingAbility: "intermediate",
  kitchenAppliances: ["Oven", "Hob"],
  mealTimes: { breakfast: "08:00", lunch: "13:00", dinner: "19:00", snack: "16:00" },
  favouriteDrinks: "",
  favouriteSnacks: "",

  wakeTime: "07:00",
  bedtime: "23:00",
  workSchedule: "",
  dailyActivity: "",
};

export function toList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
