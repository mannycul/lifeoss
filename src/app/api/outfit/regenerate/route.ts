import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateTodayOutfit } from "@/lib/data/outfit";
import { getTodayWeather } from "@/lib/data/weather";
import { todayISO } from "@/lib/utils";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase.from("outfit_recommendations").delete().eq("user_id", user.id).eq("date", todayISO());

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

  const weather = await getTodayWeather(supabase, profile);
  const outfit = await getOrCreateTodayOutfit(supabase, user.id, weather);

  return NextResponse.json({ outfit });
}
