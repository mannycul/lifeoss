import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordMemorySignal } from "@/lib/ai/memory";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId, liked, ingredientNames } = (await request.json()) as {
    itemId: string;
    liked: boolean;
    ingredientNames: string[];
  };

  await supabase.from("meal_plan_items").update({ liked }).eq("id", itemId).eq("user_id", user.id);

  for (const name of ingredientNames.slice(0, 5)) {
    await recordMemorySignal(supabase, user.id, "food", name, liked ? "liked" : "disliked");
  }

  return NextResponse.json({ ok: true });
}
