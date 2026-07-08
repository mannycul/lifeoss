import { Label, Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/database.types";
import type { OnboardingData } from "./types";
import { Flame, Dumbbell, Scale } from "lucide-react";

const GOALS: { value: Goal; label: string; body: string; icon: typeof Flame }[] = [
  { value: "lose_fat", label: "Lose fat", body: "Calorie deficit, high protein to preserve muscle", icon: Flame },
  { value: "build_muscle", label: "Build muscle", body: "Calorie surplus with high protein targets", icon: Dumbbell },
  { value: "maintain", label: "Maintain", body: "Stay balanced at your current weight", icon: Scale },
];

export function StepGoals({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">What’s your goal?</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">LifeOS builds your meal plans and macros around this.</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {GOALS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onChange({ goal: g.value })}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] border p-4 text-left transition-colors",
              data.goal === g.value
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)]"
            )}
          >
            <g.icon className={cn("size-5", data.goal === g.value ? "text-[var(--accent)]" : "text-[var(--muted)]")} />
            <div>
              <div className="text-sm font-medium">{g.label}</div>
              <div className="text-xs text-[var(--muted)]">{g.body}</div>
            </div>
          </button>
        ))}
      </div>
      <div>
        <Label htmlFor="location">Location (for weather &amp; outfit planning)</Label>
        <Input
          id="location"
          value={data.locationName}
          onChange={(e) => onChange({ locationName: e.target.value })}
          placeholder="London, UK"
        />
      </div>
    </div>
  );
}
