"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Label, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updateAppearanceAction } from "@/app/(app)/settings/actions";
import type { Profile } from "@/lib/database.types";

export function AppearanceSettings({ profile }: { profile: Profile }) {
  const [units, setUnits] = useState(profile.units);
  const [currency, setCurrency] = useState(profile.currency);
  const [theme, setTheme] = useState(profile.theme);
  const [waterGoal, setWaterGoal] = useState(profile.water_goal_ml);
  const [stepGoal, setStepGoal] = useState(profile.step_goal);
  const [saving, startSaving] = useTransition();
  const router = useRouter();

  function applyTheme(next: "dark" | "light") {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("lifeos-theme", next);
  }

  function save() {
    startSaving(async () => {
      await updateAppearanceAction({ units, currency, theme, waterGoalMl: waterGoal, stepGoal });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Appearance &amp; units</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Theme is saved to your account and syncs across devices.</p>
      </div>

      <div>
        <Label>Theme</Label>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              onClick={() => applyTheme(t)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border py-2.5 text-sm capitalize transition-colors",
                theme === t ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"
              )}
            >
              {t === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="units">Units</Label>
          <Select id="units" value={units} onChange={(e) => setUnits(e.target.value as Profile["units"])}>
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, ft)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as Profile["currency"])}>
            <option value="GBP">£ GBP</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="water">Daily water goal (ml)</Label>
          <Input id="water" type="number" step={250} value={waterGoal} onChange={(e) => setWaterGoal(Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="steps">Daily step goal</Label>
          <Input id="steps" type="number" step={500} value={stepGoal} onChange={(e) => setStepGoal(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex justify-end border-t border-[var(--border)] pt-5">
        <Button size="sm" onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
