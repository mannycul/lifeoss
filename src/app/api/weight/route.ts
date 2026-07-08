import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weightKg } = (await request.json()) as { weightKg: number };
  await supabase.from("weight_logs").upsert({ user_id: user.id, weight_kg: weightKg, logged_at: todayISO() }, { onConflict: "user_id,logged_at" });
  await supabase.from("profiles").update({ weight_kg: weightKg }).eq("id", user.id);

  return NextResponse.json({ weightKg });
}
