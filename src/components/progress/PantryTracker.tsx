"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, todayISO, addDaysISO } from "@/lib/utils";
import { SHOPPING_CATEGORIES } from "@/lib/constants";
import type { PantryItem, ShoppingCategory } from "@/lib/database.types";

export function PantryTracker({ items: initialItems }: { items: PantryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("other");
  const [expiry, setExpiry] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const today = todayISO();
  const in7Days = addDaysISO(7);

  async function add() {
    if (!name.trim()) return;
    const res = await fetch("/api/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category, expiryDate: expiry || undefined }),
    });
    const { item } = await res.json();
    setItems((prev) => [item, ...prev]);
    setName("");
    setExpiry("");
    router.refresh();
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await fetch("/api/pantry", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    });
  }

  async function getSuggestion() {
    setLoadingSuggestion(true);
    try {
      const res = await fetch("/api/pantry/suggest", { method: "POST" });
      const data = await res.json();
      setSuggestion(data.suggestion);
    } finally {
      setLoadingSuggestion(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pantry &amp; expiry tracker</CardTitle>
        <Button size="sm" variant="secondary" onClick={getSuggestion} loading={loadingSuggestion} className="gap-1.5">
          <Sparkles className="size-3.5" /> Leftover ideas
        </Button>
      </CardHeader>
      <CardContent>
        {suggestion && (
          <div className="mb-4 rounded-[var(--radius-sm)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-3 text-sm">
            {suggestion}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <Input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-[8rem]" />
          <Select value={category} onChange={(e) => setCategory(e.target.value as ShoppingCategory)} className="w-40">
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-40" />
          <Button size="md" variant="secondary" onClick={add}>
            <Plus className="size-4" />
          </Button>
        </div>

        {!items.length ? (
          <p className="text-sm text-[var(--muted)]">No pantry items tracked yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {items.map((item) => {
              const expired = item.expiry_date && item.expiry_date < today;
              const expiringSoon = item.expiry_date && !expired && item.expiry_date <= in7Days;
              return (
                <li key={item.id} className="group flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm", expired && "text-[var(--muted-2)] line-through")}>{item.name}</span>
                    {expired && <Badge tone="danger">Expired</Badge>}
                    {expiringSoon && (
                      <Badge tone="warning" className="gap-1">
                        <AlertTriangle className="size-3" /> Expires soon
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {item.expiry_date && <span className="text-xs text-[var(--muted)]">{item.expiry_date}</span>}
                    <button onClick={() => remove(item.id)} className="text-[var(--muted-2)] opacity-0 transition-opacity hover:text-[var(--danger)] group-hover:opacity-100">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
