import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShoppingCart, ArrowRight } from "lucide-react";

export function ShoppingReminderCard({ remaining, expiringSoon }: { remaining: number; expiringSoon: number }) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Shopping</CardTitle>
        <ShoppingCart className="size-4 text-[var(--muted)]" />
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-semibold tracking-tight">{remaining}</span>
        <p className="mt-1 text-xs text-[var(--muted)]">items left to buy this week</p>
        {expiringSoon > 0 && (
          <p className="mt-2 text-xs text-[var(--warning)]">{expiringSoon} pantry item{expiringSoon > 1 ? "s" : ""} expiring soon</p>
        )}
        <Link href="/shopping" className="mt-3 flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
          Open list <ArrowRight className="size-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
