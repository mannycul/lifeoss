import { createClient } from "@/lib/supabase/server";
import { WardrobeManager } from "@/components/wardrobe/WardrobeManager";
import type { WardrobeItem } from "@/lib/database.types";

export default async function WardrobePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase.from("wardrobe_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Wardrobe</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          LifeOS only recommends outfits from what’s here — keep it up to date.
        </p>
      </div>
      <WardrobeManager initialItems={(items ?? []) as WardrobeItem[]} />
    </div>
  );
}
