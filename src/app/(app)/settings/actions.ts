"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Units, Currency, Theme } from "@/lib/database.types";

export async function updateAppearanceAction(patch: {
  units?: Units;
  currency?: Currency;
  theme?: Theme;
  waterGoalMl?: number;
  stepGoal?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("profiles")
    .update({
      ...(patch.units && { units: patch.units }),
      ...(patch.currency && { currency: patch.currency }),
      ...(patch.theme && { theme: patch.theme }),
      ...(patch.waterGoalMl && { water_goal_ml: patch.waterGoalMl }),
      ...(patch.stepGoal && { step_goal: patch.stepGoal }),
    })
    .eq("id", user.id);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function forgetMemoryAction(id: string) {
  const supabase = await createClient();
  await supabase.from("ai_memory").delete().eq("id", id);
  revalidatePath("/settings");
}
