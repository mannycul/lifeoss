export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose_fat" | "build_muscle" | "maintain";
export type Units = "metric" | "imperial";
export type Currency = "GBP" | "USD" | "EUR";
export type Theme = "dark" | "light";
export type CookingAbility = "beginner" | "intermediate" | "confident" | "advanced";
export type WardrobeCategory =
  | "t_shirts"
  | "shirts"
  | "hoodies"
  | "jackets"
  | "jumpers"
  | "jeans"
  | "trousers"
  | "shorts"
  | "trainers"
  | "boots"
  | "accessories";
export type Season = "spring" | "summer" | "autumn" | "winter" | "all_season";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type ShoppingCategory =
  | "fruit_veg"
  | "meat"
  | "frozen"
  | "dairy"
  | "bakery"
  | "drinks"
  | "household"
  | "other";
export type MemoryCategory = "food" | "outfit" | "style";
export type Sentiment = "liked" | "disliked" | "ignored";

export type Profile = {
  id: string;
  full_name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  daily_calorie_target: number | null;
  daily_protein_target: number | null;
  water_goal_ml: number;
  step_goal: number;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  units: Units;
  currency: Currency;
  theme: Theme;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export type FoodPreferences = {
  user_id: string;
  weekly_food_budget: number;
  favourite_foods: string[];
  disliked_foods: string[];
  never_recommend: string[];
  allergies: string[];
  dietary_requirements: string[];
  favourite_supermarkets: string[];
  cooking_ability: CookingAbility;
  kitchen_appliances: string[];
  preferred_meal_times: Record<MealType, string>;
  favourite_drinks: string[];
  favourite_snacks: string[];
  updated_at: string;
}

export type Lifestyle = {
  user_id: string;
  wake_time: string;
  bedtime: string;
  work_schedule: string | null;
  daily_activity: string | null;
  updated_at: string;
}

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string;
  category: WardrobeCategory;
  colour: string | null;
  season: Season;
  warmth_rating: number;
  waterproof: boolean;
  photo_url: string | null;
  times_worn: number;
  last_worn_at: string | null;
  created_at: string;
}

export type OutfitRecommendation = {
  id: string;
  user_id: string;
  date: string;
  weather_snapshot: Json;
  top_item_id: string | null;
  bottom_item_id: string | null;
  shoes_item_id: string | null;
  jacket_item_id: string | null;
  accessory_item_ids: string[];
  reasoning: string | null;
  edited: boolean;
  created_at: string;
}

export type MealPlan = {
  id: string;
  user_id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_cost: number;
  created_at: string;
}

export type Ingredient = {
  name: string;
  quantity: string;
  in_stock?: boolean;
}

export type MealPlanItem = {
  id: string;
  meal_plan_id: string;
  user_id: string;
  meal_type: MealType;
  name: string;
  ingredients: Ingredient[];
  recipe: string | null;
  calories: number;
  protein: number;
  cost: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  is_leftover: boolean;
  liked: boolean | null;
  created_at: string;
}

export type ShoppingListItem = {
  id: string;
  user_id: string;
  week_start: string;
  name: string;
  category: ShoppingCategory;
  quantity: string | null;
  estimated_cost: number;
  checked: boolean;
  created_at: string;
}

export type SpendingLogEntry = {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}

export type PantryItem = {
  id: string;
  user_id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  expiry_date: string | null;
  created_at: string;
}

export type WeightLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
}

export type WaterLog = {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export type StepLog = {
  id: string;
  user_id: string;
  steps: number;
  logged_at: string;
}

export type AiMemoryEntry = {
  id: string;
  user_id: string;
  category: MemoryCategory;
  key: string;
  sentiment: Sentiment;
  weight: number;
  updated_at: string;
}

export type DailySummary = {
  id: string;
  user_id: string;
  date: string;
  summary: string;
  created_at: string;
}

export type WeatherCache = {
  id: string;
  user_id: string;
  date: string;
  data: Json;
  fetched_at: string;
}

type Table<Row, Insert> = { Row: Row; Insert: Insert; Update: Partial<Row>; Relationships: [] };

// Minimal Supabase Database generic — hand-written to match supabase/schema.sql.
// Regenerate with `supabase gen types typescript` once the project is live if
// you want fully-generated types instead.
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }>;
      food_preferences: Table<FoodPreferences, Partial<FoodPreferences> & { user_id: string }>;
      lifestyle: Table<Lifestyle, Partial<Lifestyle> & { user_id: string }>;
      wardrobe_items: Table<WardrobeItem, Partial<WardrobeItem> & { user_id: string; name: string; category: WardrobeCategory }>;
      outfit_recommendations: Table<OutfitRecommendation, Partial<OutfitRecommendation> & { user_id: string }>;
      meal_plans: Table<MealPlan, Partial<MealPlan> & { user_id: string }>;
      meal_plan_items: Table<
        MealPlanItem,
        Partial<MealPlanItem> & { meal_plan_id: string; user_id: string; meal_type: MealType; name: string }
      >;
      shopping_list_items: Table<ShoppingListItem, Partial<ShoppingListItem> & { user_id: string; name: string; category: ShoppingCategory }>;
      spending_log: Table<SpendingLogEntry, Partial<SpendingLogEntry> & { user_id: string; amount: number }>;
      pantry_items: Table<PantryItem, Partial<PantryItem> & { user_id: string; name: string }>;
      weight_logs: Table<WeightLog, Partial<WeightLog> & { user_id: string; weight_kg: number }>;
      water_logs: Table<WaterLog, Partial<WaterLog> & { user_id: string; amount_ml: number }>;
      step_logs: Table<StepLog, Partial<StepLog> & { user_id: string; steps: number }>;
      ai_memory: Table<AiMemoryEntry, Partial<AiMemoryEntry> & { user_id: string; category: MemoryCategory; key: string; sentiment: Sentiment }>;
      daily_summaries: Table<DailySummary, Partial<DailySummary> & { user_id: string; summary: string }>;
      weather_cache: Table<WeatherCache, Partial<WeatherCache> & { user_id: string; data: Json }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
