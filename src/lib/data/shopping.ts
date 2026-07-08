import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Ingredient, ShoppingCategory } from "@/lib/database.types";
import { getWeekStart } from "@/lib/data/budget";

const KEYWORDS: [ShoppingCategory, RegExp][] = [
  ["dairy", /milk|cheese|yog(h)?urt|butter|cream|egg/i],
  ["meat", /chicken|beef|pork|lamb|turkey|bacon|sausage|salmon|tuna|fish|prawn|mince/i],
  ["frozen", /frozen|ice cream|peas \(frozen\)/i],
  ["bakery", /bread|bagel|bun|tortilla|pitta|croissant|baguette/i],
  ["fruit_veg", /apple|banana|berry|berries|broccoli|spinach|tomato|onion|garlic|potato|pepper|courgette|carrot|lettuce|avocado|lemon|lime|mushroom|cucumber|fruit|vegetable|salad/i],
  ["drinks", /juice|water|coffee|tea|soda|cordial|squash|wine|beer/i],
  ["household", /foil|cling film|bin bag|kitchen roll|washing up|detergent/i],
];

/** Best-effort supermarket-aisle for an ingredient name. */
function categorizeIngredient(name: string): ShoppingCategory {
  for (const [category, pattern] of KEYWORDS) {
    if (pattern.test(name)) return category;
  }
  return "other";
}

const CATEGORY_UNIT_COST: Record<string, number> = {
  fruit_veg: 0.8,
  meat: 3.5,
  frozen: 2,
  dairy: 1.5,
  bakery: 1.2,
  drinks: 1.5,
  household: 2,
  other: 1.5,
};

/**
 * Rebuilds the shopping list for the current week from every planned meal,
 * merging repeated ingredients and preserving the checked state of items
 * that already exist.
 */
export async function generateWeeklyShoppingList(supabase: SupabaseClient<Database>, userId: string) {
  const weekStart = getWeekStart();

  const { data: plans } = await supabase.from("meal_plans").select("id").eq("user_id", userId).gte("date", weekStart);
  const planIds = (plans ?? []).map((p) => p.id);
  if (!planIds.length) return [];

  const { data: mealItems } = await supabase
    .from("meal_plan_items")
    .select("ingredients")
    .in("meal_plan_id", planIds);

  const aggregate = new Map<string, { quantities: Set<string>; count: number }>();
  for (const row of mealItems ?? []) {
    const ingredients = (row.ingredients ?? []) as unknown as Ingredient[];
    for (const ing of ingredients) {
      if (ing.in_stock) continue;
      const key = ing.name.trim().toLowerCase();
      if (!key) continue;
      const entry = aggregate.get(key) ?? { quantities: new Set(), count: 0 };
      entry.quantities.add(ing.quantity);
      entry.count += 1;
      aggregate.set(key, entry);
    }
  }

  const { data: existing } = await supabase
    .from("shopping_list_items")
    .select("name")
    .eq("user_id", userId)
    .eq("week_start", weekStart);
  const existingNames = new Set((existing ?? []).map((e) => e.name.toLowerCase()));

  const toInsert = [...aggregate.entries()]
    .filter(([name]) => !existingNames.has(name))
    .map(([name, info]) => {
      const category = categorizeIngredient(name);
      return {
        user_id: userId,
        week_start: weekStart,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        category,
        quantity: [...info.quantities].join(", "),
        estimated_cost: Number(((CATEGORY_UNIT_COST[category] ?? 1.5) * Math.min(info.count, 3)).toFixed(2)),
        checked: false,
      };
    });

  if (toInsert.length) {
    await supabase.from("shopping_list_items").insert(toInsert);
  }

  const { data: fullList } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .order("category", { ascending: true });

  return fullList ?? [];
}

export async function getWeeklyShoppingList(supabase: SupabaseClient<Database>, userId: string) {
  const weekStart = getWeekStart();
  const { data } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .order("category", { ascending: true });
  return data ?? [];
}
