import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { steps } = (await request.json()) as { steps: number };
  await supabase.from("step_logs").upsert({ user_id: user.id, steps, logged_at: todayISO() }, { onConflict: "user_id,logged_at" });

  return NextResponse.json({ steps });
}
