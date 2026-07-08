import { cn, clamp } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  tone?: "accent" | "success" | "warning" | "danger";
}

const tones = {
  accent: "bg-[var(--accent)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};

export function ProgressBar({ value, max, className, tone = "accent" }: ProgressBarProps) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  max,
  size = 64,
  strokeWidth = 6,
  tone = "accent",
  children,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  tone?: "accent" | "success" | "warning" | "danger";
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? clamp(value / max, 0, 1) : 0;
  const colors = { accent: "var(--accent)", success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
