import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, quantity, category, expiryDate } = (await request.json()) as {
    name: string;
    quantity?: string;
    category?: string;
    expiryDate?: string;
  };

  const { data } = await supabase
    .from("pantry_items")
    .insert({ user_id: user.id, name, quantity: quantity ?? null, category: category ?? null, expiry_date: expiryDate ?? null })
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
  await supabase.from("pantry_items").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
