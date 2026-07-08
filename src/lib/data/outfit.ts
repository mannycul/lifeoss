import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Profile, WardrobeItem, OutfitRecommendation } from "@/lib/database.types";
import type { WeatherData } from "@/lib/weather";
import { buildOutfit, explainOutfit } from "@/lib/ai/outfit";
import { todayISO } from "@/lib/utils";

export interface OutfitWithItems {
  recommendation: OutfitRecommendation;
  top: WardrobeItem | null;
  bottom: WardrobeItem | null;
  shoes: WardrobeItem | null;
  jacket: WardrobeItem | null;
  accessories: WardrobeItem[];
}

export async function getOrCreateTodayOutfit(
  supabase: SupabaseClient<Database>,
  userId: string,
  weather: WeatherData | null
): Promise<OutfitWithItems | null> {
  const date = todayISO();

  const { data: wardrobe } = await supabase.from("wardrobe_items").select("*").eq("user_id", userId);
  const items = (wardrobe ?? []) as WardrobeItem[];
  const byId = new Map(items.map((i) => [i.id, i]));

  const { data: existing } = await supabase
    .from("outfit_recommendations")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    return hydrate(existing as OutfitRecommendation, byId);
  }

  if (!weather || !items.length) return null;

  const { data: memory } = await supabase.from("ai_memory").select("*").eq("user_id", userId).eq("category", "outfit");

  const pick = buildOutfit(items, weather, memory ?? []);
  const reasoning = await explainOutfit(pick, weather);

  const { data: created } = await supabase
    .from("outfit_recommendations")
    .insert({
      user_id: userId,
      date,
      weather_snapshot: weather as unknown as Database["public"]["Tables"]["outfit_recommendations"]["Row"]["weather_snapshot"],
      top_item_id: pick.top?.id ?? null,
      bottom_item_id: pick.bottom?.id ?? null,
      shoes_item_id: pick.shoes?.id ?? null,
      jacket_item_id: pick.jacket?.id ?? null,
      accessory_item_ids: pick.accessories.map((a) => a.id),
      reasoning,
    })
    .select()
    .single();

  if (!created) return null;
  return hydrate(created as OutfitRecommendation, byId);
}

function hydrate(rec: OutfitRecommendation, byId: Map<string, WardrobeItem>): OutfitWithItems {
  return {
    recommendation: rec,
    top: rec.top_item_id ? byId.get(rec.top_item_id) ?? null : null,
    bottom: rec.bottom_item_id ? byId.get(rec.bottom_item_id) ?? null : null,
    shoes: rec.shoes_item_id ? byId.get(rec.shoes_item_id) ?? null : null,
    jacket: rec.jacket_item_id ? byId.get(rec.jacket_item_id) ?? null : null,
    accessories: rec.accessory_item_ids.map((id) => byId.get(id)).filter(Boolean) as WardrobeItem[],
  };
}

export type { Profile };
