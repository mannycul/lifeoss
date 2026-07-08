"use client";

import { useState, useTransition } from "react";
import { Printer, Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { SHOPPING_CATEGORIES } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { ShoppingListItem, Currency, ShoppingCategory } from "@/lib/database.types";
import { useRouter } from "next/navigation";

export function ShoppingList({ initialItems, currency }: { initialItems: ShoppingListItem[]; currency: Currency }) {
  const [items, setItems] = useState(initialItems);
  const [generating, setGenerating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ShoppingCategory>("other");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const total = items.reduce((sum, i) => sum + Number(i.estimated_cost), 0);
  const remaining = items.filter((i) => !i.checked).length;

  function toggle(id: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    startTransition(async () => {
      await fetch("/api/shopping/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, checked }),
      });
    });
  }

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/shopping/generate", { method: "POST" });
      const data = await res.json();
      setItems(data.list ?? []);
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function addManual() {
    if (!newName.trim()) return;
    const created: ShoppingListItem = {
      id: crypto.randomUUID(),
      user_id: "",
      week_start: "",
      name: newName.trim(),
      category: newCategory,
      quantity: null,
      estimated_cost: 0,
      checked: false,
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, created]);
    setNewName("");
    await fetch("/api/shopping/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: created.name, category: created.category }),
    });
    router.refresh();
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await fetch("/api/shopping/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    });
  }

  const grouped = SHOPPING_CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.value),
  })).filter((g) => g.items.length);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold tracking-tight">{formatCurrency(total, currency)}</span>
          <span className="text-sm text-[var(--muted)]">estimated · {remaining} left to buy</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => window.print()} className="gap-1.5">
            <Printer className="size-3.5" /> Print
          </Button>
          <Button size="sm" onClick={generate} loading={generating} className="gap-1.5">
            <Sparkles className="size-3.5" /> Rebuild from meal plan
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2 no-print">
        <Input placeholder="Add an item..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addManual()} />
        <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value as ShoppingCategory)} className="w-44">
          {SHOPPING_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <Button size="md" variant="secondary" onClick={addManual}>
          <Plus className="size-4" />
        </Button>
      </div>

      {!grouped.length ? (
        <p className="text-sm text-[var(--muted)]">No items yet — generate meals first, or add items manually.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.value}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{group.label}</h3>
              <div className="divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
                {group.items.map((item) => (
                  <div key={item.id} className="group flex items-center gap-3 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => toggle(item.id, e.target.checked)}
                      className="size-4 accent-[var(--accent)]"
                    />
                    <span className={cn("flex-1 text-sm", item.checked && "text-[var(--muted-2)] line-through")}>
                      {item.name}
                      {item.quantity && <span className="ml-2 text-xs text-[var(--muted)]">{item.quantity}</span>}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{formatCurrency(Number(item.estimated_cost), currency)}</span>
                    <button onClick={() => remove(item.id)} className="text-[var(--muted-2)] opacity-0 transition-opacity hover:text-[var(--danger)] group-hover:opacity-100 no-print">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
