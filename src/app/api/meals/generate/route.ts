import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAndSaveTodayMealPlan } from "@/lib/data/meals";
import { generateWeeklyShoppingList } from "@/lib/data/shopping";
import type { Profile, FoodPreferences } from "@/lib/database.types";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("food_preferences").select("*").eq("user_id", user.id).single(),
  ]);

  if (!profile || !preferences) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  const result = await generateAndSaveTodayMealPlan(supabase, user.id, profile as Profile, preferences as FoodPreferences);
  const shoppingList = await generateWeeklyShoppingList(supabase, user.id);

  return NextResponse.json({ ...result, shoppingList });
}
