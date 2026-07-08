"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Label, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { WARDROBE_CATEGORIES, SEASONS } from "@/lib/constants";
import type { WardrobeCategory, Season } from "@/lib/database.types";

export interface NewWardrobeItem {
  name: string;
  category: WardrobeCategory;
  colour: string;
  season: Season;
  warmthRating: number;
  waterproof: boolean;
  photoUrl: string | null;
}

export function WardrobeItemForm({
  onAdd,
  adding,
}: {
  onAdd: (item: NewWardrobeItem) => Promise<void> | void;
  adding?: boolean;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WardrobeCategory>("t_shirts");
  const [colour, setColour] = useState("");
  const [season, setSeason] = useState<Season>("all_season");
  const [warmth, setWarmth] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("wardrobe-photos").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("wardrobe-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } catch {
      // upload failed — item can still be saved without a photo
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!name.trim()) return;
    await onAdd({ name: name.trim(), category, colour: colour.trim(), season, warmthRating: warmth, waterproof, photoUrl });
    setName("");
    setColour("");
    setPhotoUrl(null);
    setWarmth(3);
    setWaterproof(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)]/50 p-4">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="size-full object-cover" />
          ) : uploading ? (
            <Loader2 className="size-5 animate-spin text-[var(--muted)]" />
          ) : (
            <Camera className="size-5 text-[var(--muted)]" />
          )}
          {photoUrl && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoUrl(null);
              }}
              className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="size-2.5" />
            </span>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </button>

        <div className="grid flex-1 grid-cols-2 gap-2.5">
          <Input placeholder="Name (e.g. Navy overshirt)" value={name} onChange={(e) => setName(e.target.value)} className="col-span-2" />
          <Select value={category} onChange={(e) => setCategory(e.target.value as WardrobeCategory)}>
            {WARDROBE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Input placeholder="Colour" value={colour} onChange={(e) => setColour(e.target.value)} />
          <Select value={season} onChange={(e) => setSeason(e.target.value as Season)}>
            {SEASONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-2">
            <Label htmlFor="warmth" className="mb-0 whitespace-nowrap">
              Warmth {warmth}/5
            </Label>
            <input
              id="warmth"
              type="range"
              min={1}
              max={5}
              value={warmth}
              onChange={(e) => setWarmth(Number(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <input type="checkbox" checked={waterproof} onChange={(e) => setWaterproof(e.target.checked)} className="accent-[var(--accent)]" />
          Waterproof
        </label>
        <Button type="button" size="sm" onClick={submit} loading={!!adding} disabled={!name.trim() || uploading}>
          Add item
        </Button>
      </div>
    </div>
  );
}
