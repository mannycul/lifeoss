import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyShoppingList } from "@/lib/data/shopping";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await generateWeeklyShoppingList(supabase, user.id);
  return NextResponse.json({ list });
}
