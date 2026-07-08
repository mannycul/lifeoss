"use client";

import { useState, useTransition } from "react";
import { WardrobeItemForm, type NewWardrobeItem } from "@/components/wardrobe/WardrobeItemForm";
import { WardrobeGrid } from "@/components/wardrobe/WardrobeGrid";
import { addWardrobeItemAction, deleteWardrobeItemAction } from "@/lib/actions/wardrobe";
import type { WardrobeItem } from "@/lib/database.types";

export function StepWardrobe({ initialItems }: { initialItems: WardrobeItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();

  async function handleAdd(item: NewWardrobeItem) {
    const created = await addWardrobeItemAction({
      name: item.name,
      category: item.category,
      colour: item.colour,
      season: item.season,
      warmthRating: item.warmthRating,
      waterproof: item.waterproof,
      photoUrl: item.photoUrl,
    });
    setItems((prev) => [created as WardrobeItem, ...prev]);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => {
      deleteWardrobeItemAction(id);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Build your wardrobe</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Add a few key pieces now — LifeOS will only ever recommend outfits from what’s here. You can add more any time in Settings.
        </p>
      </div>
      <WardrobeItemForm onAdd={handleAdd} />
      <WardrobeGrid items={items} onDelete={handleDelete} />
      {pending && <p className="text-xs text-[var(--muted-2)]">Syncing...</p>}
    </div>
  );
}
