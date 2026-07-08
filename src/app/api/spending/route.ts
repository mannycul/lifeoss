import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, description } = (await request.json()) as { amount: number; description?: string };
  const { data } = await supabase
    .from("spending_log")
    .insert({ user_id: user.id, amount, description: description ?? null, date: todayISO() })
    .select()
    .single();

  return NextResponse.json({ entry: data });
}
