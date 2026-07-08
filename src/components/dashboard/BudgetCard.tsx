import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { BudgetSummary } from "@/lib/data/budget";
import type { Currency } from "@/lib/database.types";

export function BudgetCard({ budget, currency }: { budget: BudgetSummary; currency: Currency }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Weekly food budget</CardTitle>
        <Wallet className="size-4 text-[var(--muted)]" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tracking-tight">{formatCurrency(budget.remaining, currency)}</span>
          <span className="text-xs text-[var(--muted)]">left of {formatCurrency(budget.weeklyBudget, currency)}</span>
        </div>
        <ProgressBar
          value={budget.spent}
          max={budget.weeklyBudget}
          className="mt-3"
          tone={budget.onTrack ? "accent" : "warning"}
        />
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{formatCurrency(budget.averageDailySpend, currency)}/day avg</span>
          {!budget.onTrack ? (
            <Badge tone="warning">Trending over budget</Badge>
          ) : (
            <Badge tone="success">On track</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
