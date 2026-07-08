import { cn, todayISO } from "@/lib/utils";

interface DaySummary {
  date: string;
  hasPlan: boolean;
  totalCalories: number;
}

export function WeeklyMealStrip({ days }: { days: DaySummary[] }) {
  const today = todayISO();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const d = new Date(day.date);
        const isToday = day.date === today;
        return (
          <div
            key={day.date}
            className={cn(
              "flex w-16 shrink-0 flex-col items-center gap-1 rounded-[var(--radius-md)] border px-2 py-3 text-center",
              isToday ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface-2)]"
            )}
          >
            <span className="text-[10px] uppercase text-[var(--muted)]">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
            <span className="text-sm font-medium">{d.getDate()}</span>
            <span
              className={cn(
                "mt-1 size-1.5 rounded-full",
                day.hasPlan ? "bg-[var(--success)]" : "bg-[var(--surface-hover)]"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
