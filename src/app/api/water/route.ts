import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amountMl } = (await request.json()) as { amountMl: number };
  await supabase.from("water_logs").insert({ user_id: user.id, amount_ml: amountMl, logged_at: todayISO() });

  const { data: rows } = await supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).eq("logged_at", todayISO());
  const total = (rows ?? []).reduce((sum, r) => sum + r.amount_ml, 0);

  return NextResponse.json({ total });
}
