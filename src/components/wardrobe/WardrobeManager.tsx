"use client";

import { useState, useTransition } from "react";
import { WardrobeItemForm, type NewWardrobeItem } from "./WardrobeItemForm";
import { WardrobeGrid } from "./WardrobeGrid";
import { addWardrobeItemAction, deleteWardrobeItemAction } from "@/lib/actions/wardrobe";
import { WARDROBE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WardrobeItem, WardrobeCategory } from "@/lib/database.types";

export function WardrobeManager({ initialItems }: { initialItems: WardrobeItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<WardrobeCategory | "all">("all");
  const [, startTransition] = useTransition();

  async function handleAdd(item: NewWardrobeItem) {
    const created = await addWardrobeItemAction(item);
    setItems((prev) => [created as WardrobeItem, ...prev]);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => {
      deleteWardrobeItemAction(id);
    });
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="space-y-5">
      <WardrobeItemForm onAdd={handleAdd} />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            filter === "all" ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"
          )}
        >
          All ({items.length})
        </button>
        {WARDROBE_CATEGORIES.map((c) => {
          const count = items.filter((i) => i.category === c.value).length;
          if (!count) return null;
          return (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                filter === c.value ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"
              )}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      <WardrobeGrid items={filtered} onDelete={handleDelete} />
    </div>
  );
}
