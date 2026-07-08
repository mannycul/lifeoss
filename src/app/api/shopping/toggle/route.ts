import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, checked } = (await request.json()) as { id: string; checked: boolean };
  await supabase.from("shopping_list_items").update({ checked }).eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
