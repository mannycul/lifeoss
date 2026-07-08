import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Profile } from "@/lib/database.types";
import { fetchWeather, type WeatherData } from "@/lib/weather";
import { todayISO } from "@/lib/utils";

export async function getTodayWeather(
  supabase: SupabaseClient<Database>,
  profile: Pick<Profile, "id" | "latitude" | "longitude">
): Promise<WeatherData | null> {
  if (profile.latitude == null || profile.longitude == null) return null;

  const date = todayISO();
  const { data: cached } = await supabase
    .from("weather_cache")
    .select("data")
    .eq("user_id", profile.id)
    .eq("date", date)
    .maybeSingle();

  if (cached) return cached.data as unknown as WeatherData;

  const weather = await fetchWeather(profile.latitude, profile.longitude);
  await supabase.from("weather_cache").upsert({
    user_id: profile.id,
    date,
    data: weather as unknown as Database["public"]["Tables"]["weather_cache"]["Row"]["data"],
  });
  return weather;
}
