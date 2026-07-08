import { createClient } from "@/lib/supabase/server";
import { WeightTracker } from "@/components/progress/WeightTracker";
import { ActivityChart } from "@/components/progress/ActivityChart";
import { PantryTracker } from "@/components/progress/PantryTracker";
import { addDaysISO } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("units").eq("id", user.id).single();

  const since = addDaysISO(-29);
  const [{ data: weightLogs }, { data: waterLogs }, { data: stepLogs }, { data: pantry }] = await Promise.all([
    supabase.from("weight_logs").select("*").eq("user_id", user.id).gte("logged_at", since),
    supabase.from("water_logs").select("amount_ml, logged_at").eq("user_id", user.id).gte("logged_at", since),
    supabase.from("step_logs").select("*").eq("user_id", user.id).gte("logged_at", since),
    supabase.from("pantry_items").select("*").eq("user_id", user.id).order("expiry_date", { ascending: true, nullsFirst: false }),
  ]);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const waterByDate = new Map<string, number>();
  for (const row of waterLogs ?? []) waterByDate.set(row.logged_at, (waterByDate.get(row.logged_at) ?? 0) + row.amount_ml);
  const stepsByDate = new Map((stepLogs ?? []).map((r) => [r.logged_at, r.steps]));

  const waterData = last7.map((date) => ({
    label: new Date(date).toLocaleDateString("en-GB", { weekday: "short" }),
    value: Math.round((waterByDate.get(date) ?? 0) / 100) / 10,
  }));
  const stepsData = last7.map((date) => ({
    label: new Date(date).toLocaleDateString("en-GB", { weekday: "short" }),
    value: stepsByDate.get(date) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Weight, hydration, steps and what’s about to expire.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WeightTracker logs={weightLogs ?? []} units={(profile as Pick<Profile, "units"> | null)?.units ?? "metric"} />
        <ActivityChart title="Hydration (last 7 days)" data={waterData} suffix="L" color="var(--accent)" />
        <ActivityChart title="Steps (last 7 days)" data={stepsData} suffix="steps" color="var(--success)" />
        <div className="sm:col-span-2">
          <PantryTracker items={pantry ?? []} />
        </div>
      </div>
    </div>
  );
}
