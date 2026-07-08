import { Label, Input, Select, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { APPLIANCE_OPTIONS, type OnboardingData } from "./types";
import type { MealType } from "@/lib/database.types";

export function StepFood({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
}) {
  function toggleAppliance(name: string) {
    const has = data.kitchenAppliances.includes(name);
    onChange({
      kitchenAppliances: has ? data.kitchenAppliances.filter((a) => a !== name) : [...data.kitchenAppliances, name],
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Food &amp; budget</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">The more detail, the better your meal plans.</p>
      </div>

      <div>
        <Label htmlFor="budget">Weekly food budget (£)</Label>
        <Input id="budget" type="number" min={0} value={data.weeklyFoodBudget} onChange={(e) => onChange({ weeklyFoodBudget: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="favFoods">Favourite foods</Label>
          <Textarea id="favFoods" rows={2} placeholder="Chicken, salmon, pasta..." value={data.favouriteFoods} onChange={(e) => onChange({ favouriteFoods: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="dislikedFoods">Foods you dislike</Label>
          <Textarea id="dislikedFoods" rows={2} placeholder="Mushrooms, olives..." value={data.dislikedFoods} onChange={(e) => onChange({ dislikedFoods: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="neverFoods">Never recommend</Label>
          <Textarea id="neverFoods" rows={2} placeholder="Liver, anchovies..." value={data.neverRecommend} onChange={(e) => onChange({ neverRecommend: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea id="allergies" rows={2} placeholder="Peanuts, shellfish..." value={data.allergies} onChange={(e) => onChange({ allergies: e.target.value })} />
        </div>
      </div>

      <div>
        <Label htmlFor="dietary">Dietary requirements</Label>
        <Input id="dietary" placeholder="Vegetarian, gluten-free, halal..." value={data.dietaryRequirements} onChange={(e) => onChange({ dietaryRequirements: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="supermarkets">Favourite supermarkets</Label>
        <Input id="supermarkets" placeholder="Tesco, Aldi, Waitrose..." value={data.favouriteSupermarkets} onChange={(e) => onChange({ favouriteSupermarkets: e.target.value })} />
      </div>

      <div>
        <Label htmlFor="cooking">Cooking ability</Label>
        <Select id="cooking" value={data.cookingAbility} onChange={(e) => onChange({ cookingAbility: e.target.value as OnboardingData["cookingAbility"] })}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="confident">Confident</option>
          <option value="advanced">Advanced</option>
        </Select>
      </div>

      <div>
        <Label>Kitchen appliances</Label>
        <div className="flex flex-wrap gap-2">
          {APPLIANCE_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAppliance(a)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                data.kitchenAppliances.includes(a)
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Preferred meal times</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(data.mealTimes) as MealType[]).map((meal) => (
            <div key={meal}>
              <Label htmlFor={`time-${meal}`} className="capitalize">
                {meal}
              </Label>
              <Input
                id={`time-${meal}`}
                type="time"
                value={data.mealTimes[meal]}
                onChange={(e) => onChange({ mealTimes: { ...data.mealTimes, [meal]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="drinks">Favourite drinks</Label>
          <Input id="drinks" placeholder="Coffee, orange juice..." value={data.favouriteDrinks} onChange={(e) => onChange({ favouriteDrinks: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="snacks">Favourite snacks</Label>
          <Input id="snacks" placeholder="Nuts, protein bars..." value={data.favouriteSnacks} onChange={(e) => onChange({ favouriteSnacks: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
