"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function GenerateMealsButton({ label = "Generate today's meals" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    try {
      await fetch("/api/meals/generate", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={generate} loading={loading} className="gap-1.5">
      <Sparkles className="size-3.5" /> {label}
    </Button>
  );
}
