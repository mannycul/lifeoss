import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col gap-2">
          <div
            className={cn(
              "h-1 rounded-full transition-colors duration-300",
              i < current ? "bg-[var(--accent)]" : i === current ? "bg-[var(--accent)]" : "bg-[var(--surface-2)]"
            )}
          />
          <span
            className={cn(
              "hidden text-[11px] sm:flex items-center gap-1",
              i <= current ? "text-[var(--foreground)]" : "text-[var(--muted-2)]"
            )}
          >
            {i < current && <Check className="size-3 text-[var(--accent)]" />}
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
