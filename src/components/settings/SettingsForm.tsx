"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StepPersonal } from "@/components/onboarding/StepPersonal";
import { StepGoals } from "@/components/onboarding/StepGoals";
import { StepFood } from "@/components/onboarding/StepFood";
import { StepLifestyle } from "@/components/onboarding/StepLifestyle";
import { AppearanceSettings } from "./AppearanceSettings";
import { MemoryPanel } from "./MemoryPanel";
import { saveOnboardingDetailsAction } from "@/app/onboarding/actions";
import { defaultOnboardingData, type OnboardingData } from "@/components/onboarding/types";
import type { AiMemoryEntry, Profile } from "@/lib/database.types";

const TABS = ["Personal", "Goals", "Food", "Lifestyle", "Appearance", "Wardrobe", "Memory"] as const;

export function SettingsForm({
  initialData,
  profile,
  memory,
}: {
  initialData: Partial<OnboardingData>;
  profile: Profile;
  memory: AiMemoryEntry[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Personal");
  const [data, setData] = useState<OnboardingData>({ ...defaultOnboardingData, ...initialData });
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function patch(p: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...p }));
    setSaved(false);
  }

  function save() {
    startSaving(async () => {
      await saveOnboardingDetailsAction(data);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[160px_1fr]">
      <nav className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition-colors",
              tab === t ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
        {tab === "Personal" && <StepPersonal data={data} onChange={patch} />}
        {tab === "Goals" && <StepGoals data={data} onChange={patch} />}
        {tab === "Food" && <StepFood data={data} onChange={patch} />}
        {tab === "Lifestyle" && <StepLifestyle data={data} onChange={patch} />}
        {tab === "Appearance" && <AppearanceSettings profile={profile} />}
        {tab === "Memory" && <MemoryPanel entries={memory} />}
        {tab === "Wardrobe" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Shirt className="size-6 text-[var(--muted-2)]" />
            <p className="text-sm text-[var(--muted)]">Manage your digital wardrobe on its own page.</p>
            <Link href="/wardrobe">
              <Button variant="secondary" size="sm">Open wardrobe</Button>
            </Link>
          </div>
        )}

        {tab !== "Appearance" && tab !== "Wardrobe" && tab !== "Memory" && (
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-5">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                <Check className="size-3.5" /> Saved
              </span>
            )}
            <Button size="sm" onClick={save} loading={saving}>
              Save changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
