import { Label, Input, Select } from "@/components/ui/Input";
import type { OnboardingData } from "./types";

export function StepPersonal({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Tell us about you</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">This tunes your calorie and protein targets.</p>
      </div>
      <div>
        <Label htmlFor="fullName">Name</Label>
        <Input id="fullName" value={data.fullName} onChange={(e) => onChange({ fullName: e.target.value })} placeholder="Manny" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" min={13} max={100} value={data.age} onChange={(e) => onChange({ age: e.target.value })} placeholder="27" />
        </div>
        <div>
          <Label htmlFor="height">Height (cm)</Label>
          <Input id="height" type="number" min={100} max={250} value={data.heightCm} onChange={(e) => onChange({ heightCm: e.target.value })} placeholder="178" />
        </div>
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" min={30} max={300} value={data.weightKg} onChange={(e) => onChange({ weightKg: e.target.value })} placeholder="75" />
        </div>
      </div>
      <div>
        <Label htmlFor="activity">Activity level</Label>
        <Select id="activity" value={data.activityLevel} onChange={(e) => onChange({ activityLevel: e.target.value as OnboardingData["activityLevel"] })}>
          <option value="sedentary">Sedentary — desk job, little exercise</option>
          <option value="light">Light — exercise 1-3 days/week</option>
          <option value="moderate">Moderate — exercise 3-5 days/week</option>
          <option value="active">Active — exercise 6-7 days/week</option>
          <option value="very_active">Very active — physical job or 2x/day training</option>
        </Select>
      </div>
    </div>
  );
}
