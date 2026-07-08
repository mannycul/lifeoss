import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MemoryCategory, Sentiment } from "@/lib/database.types";

/**
 * Records a learning signal (e.g. "user skipped mushrooms" or "user always
 * picks chicken"). Repeated signals accumulate weight so stronger patterns
 * influence future AI generations more than one-off events.
 */
export async function recordMemorySignal(
  supabase: SupabaseClient<Database>,
  userId: string,
  category: MemoryCategory,
  key: string,
  sentiment: Sentiment
) {
  const normalisedKey = key.trim().toLowerCase();
  if (!normalisedKey) return;

  const { data: existing } = await supabase
    .from("ai_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .eq("key", normalisedKey)
    .maybeSingle();

  if (existing) {
    const weight = existing.sentiment === sentiment ? existing.weight + 1 : 1;
    await supabase
      .from("ai_memory")
      .update({ sentiment, weight, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("ai_memory").insert({
      user_id: userId,
      category,
      key: normalisedKey,
      sentiment,
      weight: 1,
    });
  }
}
