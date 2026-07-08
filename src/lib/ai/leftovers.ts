import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export async function suggestLeftoverRecipe(items: string[]): Promise<string> {
  if (!items.length) return "Add pantry items to get leftover ideas.";
  const fallback = `Use up ${items.slice(0, 3).join(", ")} in a quick stir-fry, frittata, or soup before they expire.`;

  const openai = getOpenAI();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a practical home cook. In 1-2 sentences, suggest one simple recipe idea that uses up the given soon-to-expire ingredients, to reduce food waste.",
        },
        { role: "user", content: `Ingredients expiring soon: ${items.join(", ")}` },
      ],
      max_tokens: 120,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
