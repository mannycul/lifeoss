import type { WardrobeCategory, Season, ShoppingCategory } from "@/lib/database.types";

export const WARDROBE_CATEGORIES: { value: WardrobeCategory; label: string }[] = [
  { value: "t_shirts", label: "T-shirts" },
  { value: "shirts", label: "Shirts" },
  { value: "hoodies", label: "Hoodies" },
  { value: "jackets", label: "Jackets" },
  { value: "jumpers", label: "Jumpers" },
  { value: "jeans", label: "Jeans" },
  { value: "trousers", label: "Trousers" },
  { value: "shorts", label: "Shorts" },
  { value: "trainers", label: "Trainers" },
  { value: "boots", label: "Boots" },
  { value: "accessories", label: "Accessories" },
];

export const WARDROBE_CATEGORY_LABEL: Record<WardrobeCategory, string> = Object.fromEntries(
  WARDROBE_CATEGORIES.map((c) => [c.value, c.label])
) as Record<WardrobeCategory, string>;

export const SEASONS: { value: Season; label: string }[] = [
  { value: "all_season", label: "All season" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
];

export const SHOPPING_CATEGORIES: { value: ShoppingCategory; label: string }[] = [
  { value: "fruit_veg", label: "Fruit & Vegetables" },
  { value: "meat", label: "Meat" },
  { value: "frozen", label: "Frozen" },
  { value: "dairy", label: "Dairy" },
  { value: "bakery", label: "Bakery" },
  { value: "drinks", label: "Drinks" },
  { value: "household", label: "Household" },
  { value: "other", label: "Other" },
];
