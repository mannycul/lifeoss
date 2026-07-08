import type { WardrobeItem, AiMemoryEntry } from "@/lib/database.types";
import type { WeatherData } from "@/lib/weather";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export interface OutfitPick {
  top: WardrobeItem | null;
  bottom: WardrobeItem | null;
  shoes: WardrobeItem | null;
  jacket: WardrobeItem | null;
  accessories: WardrobeItem[];
  reasoning: string;
  needsWaterproof: boolean;
}

const TOP_CATEGORIES = ["t_shirts", "shirts", "hoodies", "jumpers"];
const BOTTOM_CATEGORIES = ["jeans", "trousers", "shorts"];
const SHOE_CATEGORIES = ["trainers", "boots"];
const JACKET_CATEGORIES = ["jackets"];

function seasonFromMonth(month: number): string {
  if ([11, 0, 1].includes(month)) return "winter";
  if ([2, 3, 4].includes(month)) return "spring";
  if ([5, 6, 7].includes(month)) return "summer";
  return "autumn";
}

/** Warmth the outfit should provide, 1 (light) to 5 (very warm), from temperature alone. */
function targetWarmth(temp: number): number {
  if (temp >= 22) return 1;
  if (temp >= 17) return 2;
  if (temp >= 11) return 3;
  if (temp >= 5) return 4;
  return 5;
}

function score(item: WardrobeItem, opts: { warmth: number; season: string; memory: Map<string, number> }) {
  let s = 0;
  s -= Math.abs(item.warmth_rating - opts.warmth) * 2;
  if (item.season === opts.season || item.season === "all_season") s += 2;
  s += (item.times_worn ?? 0) * 0.05;
  const learned = opts.memory.get(item.name.toLowerCase()) ?? opts.memory.get(item.colour?.toLowerCase() ?? "") ?? 0;
  s += learned;
  return s;
}

function pickBest(
  items: WardrobeItem[],
  categories: string[],
  opts: { warmth: number; season: string; memory: Map<string, number>; requireWaterproof?: boolean }
) {
  let pool = items.filter((i) => categories.includes(i.category));
  if (opts.requireWaterproof) {
    const waterproofPool = pool.filter((i) => i.waterproof);
    if (waterproofPool.length) pool = waterproofPool;
  }
  if (!pool.length) return null;
  return pool.reduce((best, item) =>
    score(item, opts) > score(best, opts) ? item : best
  );
}

export function buildOutfit(
  wardrobe: WardrobeItem[],
  weather: WeatherData,
  memoryEntries: AiMemoryEntry[]
): Omit<OutfitPick, "reasoning"> {
  const season = seasonFromMonth(new Date().getMonth());
  const warmth = targetWarmth(weather.feelsLike);
  const memory = new Map<string, number>();
  for (const m of memoryEntries) {
    if (m.category !== "outfit") continue;
    memory.set(m.key.toLowerCase(), m.sentiment === "liked" ? m.weight : m.sentiment === "disliked" ? -m.weight : 0);
  }

  const needsWaterproof = weather.rainProbability >= 40;
  const needsJacket = warmth >= 3 || needsWaterproof || weather.wind >= 30;

  const top = pickBest(wardrobe, TOP_CATEGORIES, { warmth, season, memory });
  const bottom = pickBest(wardrobe, BOTTOM_CATEGORIES, { warmth, season, memory });
  const shoes = pickBest(wardrobe, SHOE_CATEGORIES, {
    warmth,
    season,
    memory,
    requireWaterproof: weather.rainProbability >= 60,
  });
  const jacket = needsJacket
    ? pickBest(wardrobe, JACKET_CATEGORIES, { warmth, season, memory, requireWaterproof: needsWaterproof })
    : null;

  const accessories = wardrobe
    .filter((i) => i.category === "accessories")
    .filter((i) => (weather.uvIndex >= 5 ? true : !/sunglasses|cap|hat/i.test(i.name)) || warmth >= 3)
    .slice(0, 2);

  return { top, bottom, shoes, jacket, accessories, needsWaterproof };
}

export async function explainOutfit(pick: Omit<OutfitPick, "reasoning">, weather: WeatherData): Promise<string> {
  const parts = [
    pick.top ? `the ${pick.top.colour ? pick.top.colour + " " : ""}${pick.top.name}` : null,
    pick.bottom ? `${pick.bottom.name}` : null,
    pick.shoes ? `${pick.shoes.name}` : null,
  ].filter(Boolean);

  const fallback = buildFallbackReasoning(pick, weather, parts as string[]);

  const openai = getOpenAI();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are LifeOS, a warm and concise personal stylist. Explain today's outfit choice in 2-3 sentences, mentioning the actual weather numbers and why each garment suits it. Never suggest anything not provided. Be specific and confident, no hedging.",
        },
        {
          role: "user",
          content: JSON.stringify({
            weather: {
              temperature: weather.temperature,
              feelsLike: weather.feelsLike,
              rainProbability: weather.rainProbability,
              wind: weather.wind,
              condition: weather.condition,
            },
            outfit: {
              top: pick.top?.name,
              bottom: pick.bottom?.name,
              shoes: pick.shoes?.name,
              jacket: pick.jacket?.name,
              accessories: pick.accessories.map((a) => a.name),
              waterproofNeeded: pick.needsWaterproof,
            },
          }),
        },
      ],
      max_tokens: 200,
      temperature: 0.6,
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function buildFallbackReasoning(pick: Omit<OutfitPick, "reasoning">, weather: WeatherData, parts: string[]) {
  let text = `Today's temperature reaches ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`;
  if (weather.rainProbability >= 30) text += ` with a ${weather.rainProbability}% chance of rain`;
  text += `. `;
  if (parts.length) text += `Wear the ${parts.join(", ")}. `;
  if (pick.jacket) text += `Bring your ${pick.jacket.waterproof ? "waterproof " : ""}${pick.jacket.name}. `;
  if (pick.needsWaterproof && !pick.jacket) text += `Consider a waterproof layer — none in your wardrobe is marked waterproof yet. `;
  if (pick.accessories.length) text += `Don't forget: ${pick.accessories.map((a) => a.name).join(", ")}.`;
  return text.trim();
}
