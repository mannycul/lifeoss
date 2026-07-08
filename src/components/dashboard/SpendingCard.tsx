import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/lib/database.types";

export function SpendingCard({ todaySpend, currency }: { todaySpend: number; currency: Currency }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Today’s spending</CardTitle>
        <Receipt className="size-4 text-[var(--muted)]" />
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-semibold tracking-tight">{formatCurrency(todaySpend, currency)}</span>
        <p className="mt-1 text-xs text-[var(--muted)]">From meals logged and manual entries today.</p>
      </CardContent>
    </Card>
  );
}
