"use client";

import { Trash2, Droplets, Shirt } from "lucide-react";
import { WARDROBE_CATEGORY_LABEL } from "@/lib/constants";
import type { WardrobeItem } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function WardrobeGrid({
  items,
  onDelete,
}: {
  items: WardrobeItem[];
  onDelete?: (id: string) => void;
}) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] py-10 text-center">
        <Shirt className="size-6 text-[var(--muted-2)]" />
        <p className="text-sm text-[var(--muted)]">No items yet — add your first piece above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="group relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex aspect-square items-center justify-center overflow-hidden bg-[var(--surface)]">
            {item.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photo_url} alt={item.name} className="size-full object-cover" />
            ) : (
              <Shirt className="size-8 text-[var(--muted-2)]" />
            )}
          </div>
          <div className="p-2.5">
            <p className="truncate text-xs font-medium">{item.name}</p>
            <p className="truncate text-[11px] text-[var(--muted)]">{WARDROBE_CATEGORY_LABEL[item.category]}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {item.colour && (
                <span className="text-[10px] text-[var(--muted-2)]">{item.colour}</span>
              )}
              {item.waterproof && <Droplets className="size-3 text-[var(--accent)]" />}
              <span
                className={cn(
                  "ml-auto text-[10px] text-[var(--muted-2)]"
                )}
              >
                {item.warmth_rating}/5 warmth
              </span>
            </div>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
