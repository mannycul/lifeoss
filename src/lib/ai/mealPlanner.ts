import { getOpenAI, OPENAI_MODEL, extractJson } from "@/lib/openai";
import type { FoodPreferences, Profile, AiMemoryEntry, PantryItem, Ingredient, MealType } from "@/lib/database.types";

export interface GeneratedMeal {
  meal_type: MealType;
  name: string;
  ingredients: Ingredient[];
  recipe: string;
  calories: number;
  protein: number;
  cost: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  is_leftover: boolean;
}

export interface MealPlanContext {
  profile: Profile;
  preferences: FoodPreferences;
  memory: AiMemoryEntry[];
  pantry: PantryItem[];
  budgetRemainingToday: number;
}

export async function generateDailyMealPlan(ctx: MealPlanContext): Promise<GeneratedMeal[]> {
  const openai = getOpenAI();
  if (!openai) return fallbackMealPlan(ctx);

  const avoid = [
    ...ctx.preferences.disliked_foods,
    ...ctx.preferences.never_recommend,
    ...ctx.preferences.allergies,
    ...ctx.memory.filter((m) => m.category === "food" && m.sentiment === "disliked").map((m) => m.key),
  ];
  const favour = [
    ...ctx.preferences.favourite_foods,
    ...ctx.memory.filter((m) => m.category === "food" && m.sentiment === "liked").map((m) => m.key),
  ];

  const calorieTarget = ctx.profile.daily_calorie_target ?? estimateCalorieTarget(ctx.profile);
  const proteinTarget = ctx.profile.daily_protein_target ?? estimateProteinTarget(ctx.profile);

  const prompt = {
    goal: ctx.profile.goal,
    calorieTarget,
    proteinTarget,
    budgetRemainingToday: ctx.budgetRemainingToday,
    cookingAbility: ctx.preferences.cooking_ability,
    kitchenAppliances: ctx.preferences.kitchen_appliances,
    dietaryRequirements: ctx.preferences.dietary_requirements,
    allergies: ctx.preferences.allergies,
    neverRecommend: ctx.preferences.never_recommend,
    avoidFoods: [...new Set(avoid)].filter(Boolean),
    favourFoods: [...new Set(favour)].filter(Boolean),
    favouriteDrinks: ctx.preferences.favourite_drinks,
    favouriteSnacks: ctx.preferences.favourite_snacks,
    mealTimes: ctx.preferences.preferred_meal_times,
    pantryToUseUp: ctx.pantry.map((p) => p.name),
  };

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are LifeOS's nutrition planner. Generate one day of meals (breakfast, lunch, dinner, snack) as a JSON array.
Rules:
- NEVER include anything in avoidFoods, allergies, or neverRecommend.
- Prefer favourFoods and pantryToUseUp when sensible to reduce waste.
- Stay within budgetRemainingToday total cost across all meals (in GBP).
- Hit calorieTarget and proteinTarget as closely as possible across the whole day.
- Match cookingAbility and only require kitchenAppliances that were listed.
- Respond with ONLY a JSON array, no prose, matching this TypeScript type exactly:
type Meal = { meal_type: "breakfast"|"lunch"|"dinner"|"snack", name: string, ingredients: {name:string, quantity:string, in_stock?:boolean}[], recipe: string, calories: number, protein: number, cost: number, prep_time_minutes: number, cook_time_minutes: number, is_leftover: boolean }`,
        },
        { role: "user", content: JSON.stringify(prompt) },
      ],
      max_tokens: 1800,
      temperature: 0.7,
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const meals = extractJson<GeneratedMeal[]>(text);
    if (Array.isArray(meals) && meals.length) return meals;
    return fallbackMealPlan(ctx);
  } catch {
    return fallbackMealPlan(ctx);
  }
}

export function estimateCalorieTarget(profile: Profile): number {
  const weight = profile.weight_kg ?? 75;
  const height = profile.height_cm ?? 175;
  const age = profile.age ?? 30;
  // Mifflin-St Jeor (assume neutral sex since not collected), then activity + goal adjustment.
  const bmr = 10 * weight + 6.25 * height - 5 * age;
  const activityMultiplier: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = bmr * (activityMultiplier[profile.activity_level ?? "moderate"] ?? 1.55);
  const goalAdjustment: Record<string, number> = { lose_fat: -450, build_muscle: 300, maintain: 0 };
  return Math.round(tdee + (goalAdjustment[profile.goal ?? "maintain"] ?? 0));
}

export function estimateProteinTarget(profile: Profile): number {
  const weight = profile.weight_kg ?? 75;
  const multiplier: Record<string, number> = { lose_fat: 2.2, build_muscle: 2.0, maintain: 1.6 };
  return Math.round(weight * (multiplier[profile.goal ?? "maintain"] ?? 1.8));
}

/** Simple template-based plan used when no OPENAI_API_KEY is configured, so the app stays usable. */
function fallbackMealPlan(ctx: MealPlanContext): GeneratedMeal[] {
  const avoid = new Set(
    [...ctx.preferences.disliked_foods, ...ctx.preferences.never_recommend, ...ctx.preferences.allergies].map((f) =>
      f.toLowerCase()
    )
  );
  const bank: GeneratedMeal[] = [
    {
      meal_type: "breakfast",
      name: "Greek yoghurt with berries and honey",
      ingredients: [
        { name: "Greek yoghurt", quantity: "250g" },
        { name: "Mixed berries", quantity: "100g" },
        { name: "Honey", quantity: "1 tbsp" },
        { name: "Granola", quantity: "40g" },
      ],
      recipe: "Layer yoghurt, berries and granola in a bowl. Drizzle with honey.",
      calories: 420,
      protein: 28,
      cost: 1.6,
      prep_time_minutes: 5,
      cook_time_minutes: 0,
      is_leftover: false,
    },
    {
      meal_type: "lunch",
      name: "Chicken and rice power bowl",
      ingredients: [
        { name: "Chicken breast", quantity: "150g" },
        { name: "Basmati rice", quantity: "80g" },
        { name: "Broccoli", quantity: "100g" },
        { name: "Soy sauce", quantity: "1 tbsp" },
      ],
      recipe: "Cook rice. Pan-fry chicken until golden, steam broccoli, combine with a splash of soy sauce.",
      calories: 620,
      protein: 52,
      cost: 2.8,
      prep_time_minutes: 10,
      cook_time_minutes: 20,
      is_leftover: false,
    },
    {
      meal_type: "dinner",
      name: "Baked salmon with roasted vegetables",
      ingredients: [
        { name: "Salmon fillet", quantity: "180g" },
        { name: "Sweet potato", quantity: "200g" },
        { name: "Courgette", quantity: "100g" },
        { name: "Olive oil", quantity: "1 tbsp" },
      ],
      recipe: "Roast sweet potato and courgette at 200°C for 20 minutes, add salmon for the final 12 minutes.",
      calories: 580,
      protein: 44,
      cost: 3.5,
      prep_time_minutes: 10,
      cook_time_minutes: 25,
      is_leftover: false,
    },
    {
      meal_type: "snack",
      name: "Apple with peanut butter",
      ingredients: [
        { name: "Apple", quantity: "1" },
        { name: "Peanut butter", quantity: "2 tbsp" },
      ],
      recipe: "Slice the apple, serve with peanut butter.",
      calories: 220,
      protein: 7,
      cost: 0.6,
      prep_time_minutes: 3,
      cook_time_minutes: 0,
      is_leftover: false,
    },
  ];
  return bank.filter((m) => !m.ingredients.some((i) => avoid.has(i.name.toLowerCase())));
}
