import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Extracts the first valid JSON object/array from a model response, tolerating code fences. */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  const jsonText = start >= 0 ? raw.slice(start) : raw;
  return JSON.parse(jsonText.trim());
}
