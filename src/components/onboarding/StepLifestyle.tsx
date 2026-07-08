import { Label, Input, Textarea } from "@/components/ui/Input";
import type { OnboardingData } from "./types";

export function StepLifestyle({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Your daily rhythm</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Helps LifeOS time reminders and meals around your day.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="wake">Wake-up time</Label>
          <Input id="wake" type="time" value={data.wakeTime} onChange={(e) => onChange({ wakeTime: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="bed">Bedtime</Label>
          <Input id="bed" type="time" value={data.bedtime} onChange={(e) => onChange({ bedtime: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="work">Work / college schedule</Label>
        <Input id="work" placeholder="Mon-Fri, 9am-5:30pm" value={data.workSchedule} onChange={(e) => onChange({ workSchedule: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="activity">Daily activity</Label>
        <Textarea
          id="activity"
          rows={3}
          placeholder="Gym 3x a week, walk the dog every morning..."
          value={data.dailyActivity}
          onChange={(e) => onChange({ dailyActivity: e.target.value })}
        />
      </div>
    </div>
  );
}
