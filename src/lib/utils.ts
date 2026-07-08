import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: "GBP" | "USD" | "EUR" = "GBP") {
  const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
  return `${symbols[currency] ?? "£"}${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", opts ?? { weekday: "long", day: "numeric", month: "long" });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** ISO date `days` from now (negative for the past), computed outside render. */
export function addDaysISO(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export function greetingForHour(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function celsius(f: number) {
  return ((f - 32) * 5) / 9;
}
