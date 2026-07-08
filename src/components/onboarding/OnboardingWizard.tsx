"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stepper } from "./Stepper";
import { StepPersonal } from "./StepPersonal";
import { StepGoals } from "./StepGoals";
import { StepFood } from "./StepFood";
import { StepLifestyle } from "./StepLifestyle";
import { StepWardrobe } from "./StepWardrobe";
import { defaultOnboardingData, type OnboardingData } from "./types";
import { saveOnboardingDetailsAction, finishOnboardingAction } from "@/app/onboarding/actions";
import type { WardrobeItem } from "@/lib/database.types";

const STEP_LABELS = ["Personal", "Goals", "Food", "Lifestyle", "Wardrobe"];

export function OnboardingWizard({
  initialData,
  wardrobeItems,
}: {
  initialData: Partial<OnboardingData>;
  wardrobeItems: WardrobeItem[];
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({ ...defaultOnboardingData, ...initialData });
  const [saving, startSaving] = useTransition();
  const [finishing, startFinishing] = useTransition();
  const router = useRouter();

  function patch(p: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...p }));
  }

  function next() {
    if (step === 3) {
      startSaving(async () => {
        await saveOnboardingDetailsAction(data);
        setStep((s) => s + 1);
      });
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    startFinishing(async () => {
      await finishOnboardingAction();
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Stepper steps={STEP_LABELS} current={step} />

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        {step === 0 && <StepPersonal data={data} onChange={patch} />}
        {step === 1 && <StepGoals data={data} onChange={patch} />}
        {step === 2 && <StepFood data={data} onChange={patch} />}
        {step === 3 && <StepLifestyle data={data} onChange={patch} />}
        {step === 4 && <StepWardrobe initialItems={wardrobeItems} />}

        <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5">
          <Button variant="ghost" size="sm" onClick={back} disabled={step === 0} className="gap-1.5">
            <ArrowLeft className="size-3.5" /> Back
          </Button>

          {step < STEP_LABELS.length - 1 ? (
            <Button size="sm" onClick={next} loading={saving} className="gap-1.5">
              Continue <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={finish} disabled={finishing} className="gap-1.5">
              {finishing ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Go to my dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
