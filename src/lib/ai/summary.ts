import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";
import type { WeatherData } from "@/lib/weather";

export interface SummaryContext {
  name: string;
  weather: WeatherData | null;
  outfitReasoning: string | null;
  mealCount: number;
  totalCalories: number;
  totalProtein: number;
  calorieTarget: number | null;
  spent: number;
  budgetRemaining: number;
  waterMl: number;
  waterGoalMl: number;
  steps: number;
  stepGoal: number;
}

export async function generateDailySummary(ctx: SummaryContext): Promise<string> {
  const fallback = fallbackSummary(ctx);
  const openai = getOpenAI();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are LifeOS, a friendly personal assistant. Write a warm, specific 2-3 sentence morning recap of the user's day ahead using only the facts given. No fluff, no generic advice, be encouraging but concise.",
        },
        { role: "user", content: JSON.stringify(ctx) },
      ],
      max_tokens: 180,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function fallbackSummary(ctx: SummaryContext): string {
  const bits: string[] = [];
  if (ctx.weather) bits.push(`it's ${ctx.weather.temperature}°C and ${ctx.weather.condition.toLowerCase()} today`);
  if (ctx.mealCount) bits.push(`${ctx.mealCount} meals planned totalling ${ctx.totalCalories} kcal and ${ctx.totalProtein}g protein`);
  bits.push(`£${ctx.budgetRemaining.toFixed(2)} left in this week's food budget`);
  return `Morning, ${ctx.name.split(" ")[0]}. ${bits.join(", ")}.`;
}
