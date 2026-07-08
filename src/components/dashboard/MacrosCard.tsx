import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { Flame, Beef } from "lucide-react";

export function MacrosCard({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
}: {
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
}) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Calories &amp; protein</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-around gap-4">
        <div className="flex flex-col items-center gap-2">
          <ProgressRing value={calories} max={calorieTarget || 1} tone="accent">
            <Flame className="size-4 text-[var(--accent)]" />
          </ProgressRing>
          <div className="text-center">
            <div className="text-sm font-medium">{calories}</div>
            <div className="text-[11px] text-[var(--muted)]">/ {calorieTarget || "—"} kcal</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ProgressRing value={protein} max={proteinTarget || 1} tone="success">
            <Beef className="size-4 text-[var(--success)]" />
          </ProgressRing>
          <div className="text-center">
            <div className="text-sm font-medium">{protein}g</div>
            <div className="text-[11px] text-[var(--muted)]">/ {proteinTarget || "—"}g protein</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
