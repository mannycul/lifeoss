import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "accent" | "success" | "warning" | "danger";
}

const tones = {
  default: "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)] border-transparent",
  success: "bg-[var(--success)]/10 text-[var(--success)] border-transparent",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-transparent",
  danger: "bg-[var(--danger)]/10 text-[var(--danger)] border-transparent",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
