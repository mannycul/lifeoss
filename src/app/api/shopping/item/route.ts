import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWeekStart } from "@/lib/data/budget";
import type { ShoppingCategory } from "@/lib/database.types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, category } = (await request.json()) as { name: string; category: ShoppingCategory };
  const { data } = await supabase
    .from("shopping_list_items")
    .insert({ user_id: user.id, week_start: getWeekStart(), name, category, estimated_cost: 0 })
    .select()
    .single();

  return NextResponse.json({ item: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = (await request.json()) as { id: string };
  await supabase.from("shopping_list_items").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
