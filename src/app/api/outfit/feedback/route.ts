import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordMemorySignal } from "@/lib/ai/memory";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recommendationId, swappedItemName, liked } = (await request.json()) as {
    recommendationId: string;
    swappedItemName?: string;
    liked?: boolean;
  };

  await supabase.from("outfit_recommendations").update({ edited: true }).eq("id", recommendationId).eq("user_id", user.id);

  if (swappedItemName) {
    await recordMemorySignal(supabase, user.id, "outfit", swappedItemName, "liked");
  }
  if (liked !== undefined) {
    await recordMemorySignal(supabase, user.id, "style", "overall", liked ? "liked" : "disliked");
  }

  return NextResponse.json({ ok: true });
}
