"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shirt, RefreshCw } from "lucide-react";
import type { OutfitWithItems } from "@/lib/data/outfit";

export function OutfitCard({ outfit }: { outfit: OutfitWithItems | null }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function regenerate() {
    setLoading(true);
    try {
      await fetch("/api/outfit/regenerate", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const pieces = outfit
    ? [outfit.top, outfit.bottom, outfit.shoes, outfit.jacket, ...outfit.accessories].filter(Boolean)
    : [];

  return (
    <Card className="animate-fade-in-up sm:col-span-2">
      <CardHeader>
        <CardTitle>Today’s outfit</CardTitle>
        <Button variant="ghost" size="sm" onClick={regenerate} loading={loading} className="gap-1.5">
          <RefreshCw className="size-3.5" /> Regenerate
        </Button>
      </CardHeader>
      <CardContent>
        {!outfit ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Shirt className="size-6 text-[var(--muted-2)]" />
            <p className="text-sm text-[var(--muted)]">
              Add wardrobe items and a location in Settings to get outfit picks.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-3 overflow-x-auto pb-1">
              {pieces.map((item) => (
                <div key={item!.id} className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center">
                  <div className="flex size-16 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)]">
                    {item!.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item!.photo_url} alt={item!.name} className="size-full object-cover" />
                    ) : (
                      <Shirt className="size-5 text-[var(--muted-2)]" />
                    )}
                  </div>
                  <span className="truncate text-[11px] text-[var(--muted)]" title={item!.name}>
                    {item!.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm leading-6 text-[var(--foreground)]/90">{outfit.recommendation.reasoning}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
