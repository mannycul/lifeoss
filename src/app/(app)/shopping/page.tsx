import { createClient } from "@/lib/supabase/server";
import { getWeeklyShoppingList } from "@/lib/data/shopping";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import type { Profile } from "@/lib/database.types";

export default async function ShoppingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single();
  const items = await getWeeklyShoppingList(supabase, user.id);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping list</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Organised by aisle, built from this week’s meal plan.</p>
      </div>
      <ShoppingList initialItems={items} currency={(profile as Pick<Profile, "currency"> | null)?.currency ?? "GBP"} />
    </div>
  );
}
