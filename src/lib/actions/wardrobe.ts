"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WardrobeCategory, Season } from "@/lib/database.types";

export async function addWardrobeItemAction(item: {
  name: string;
  category: WardrobeCategory;
  colour: string;
  season: Season;
  warmthRating: number;
  waterproof: boolean;
  photoUrl: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("wardrobe_items")
    .insert({
      user_id: user.id,
      name: item.name,
      category: item.category,
      colour: item.colour || null,
      season: item.season,
      warmth_rating: item.warmthRating,
      waterproof: item.waterproof,
      photo_url: item.photoUrl,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/onboarding");
  revalidatePath("/wardrobe");
  revalidatePath("/dashboard");
  return data;
}

export async function deleteWardrobeItemAction(id: string) {
  const supabase = await createClient();
  await supabase.from("wardrobe_items").delete().eq("id", id);
  revalidatePath("/onboarding");
  revalidatePath("/wardrobe");
  revalidatePath("/dashboard");
}
