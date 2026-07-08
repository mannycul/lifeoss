import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestLeftoverRecipe } from "@/lib/ai/leftovers";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const in7Days = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const { data: items } = await supabase
    .from("pantry_items")
    .select("name, expiry_date")
    .eq("user_id", user.id)
    .not("expiry_date", "is", null)
    .lte("expiry_date", in7Days)
    .order("expiry_date", { ascending: true });

  const suggestion = await suggestLeftoverRecipe((items ?? []).map((i) => i.name));
  return NextResponse.json({ suggestion, items: items ?? [] });
}
