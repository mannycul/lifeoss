"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AddSpendingForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    setLoading(true);
    try {
      await fetch("/api/spending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, description }),
      });
      setAmount("");
      setDescription("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <Input type="number" min={0} step={0.01} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28" />
      <Input placeholder="What for? (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 min-w-[10rem]" />
      <Button type="submit" size="md" loading={loading} className="gap-1.5">
        <Plus className="size-4" /> Log spend
      </Button>
    </form>
  );
}
