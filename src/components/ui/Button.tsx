import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-[var(--accent)] text-[#08090b] hover:bg-[var(--accent-strong)] hover:text-white font-medium",
  secondary: "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] border border-[var(--border)]",
  ghost: "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]",
  danger: "bg-transparent text-[var(--danger)] hover:bg-[var(--danger)]/10 border border-[var(--danger)]/30",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-sm px-5 py-3 gap-2",
};

export function Button({ className, variant = "primary", size = "md", loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}
