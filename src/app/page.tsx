import Link from "next/link";
import { Sparkles, CloudSun, Shirt, UtensilsCrossed, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: CloudSun,
    title: "Weather-aware outfits",
    body: "Every morning LifeOS checks the forecast and picks a top, bottom, shoes and jacket from your wardrobe — with a reason why.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meals built around you",
    body: "Breakfast to dinner, planned to hit your calorie and protein targets without breaking your weekly food budget.",
  },
  {
    icon: Wallet,
    title: "Budget that stays honest",
    body: "Track spending against your weekly grocery budget with early warnings before you go over.",
  },
  {
    icon: Sparkles,
    title: "Learns your taste",
    body: "Skip mushrooms twice and LifeOS stops suggesting them. Always pick chicken? It'll notice.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--background)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-[var(--accent)]">
            <Sparkles className="size-4 text-[#08090b]" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6">
        <section className="flex flex-col items-center pt-20 pb-16 text-center animate-fade-in-up">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
            <Sparkles className="size-3 text-[var(--accent)]" /> Your AI personal assistant
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            One assistant for meals, outfits, and the rest of your day.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">
            LifeOS learns your goals, your wardrobe and your budget, then plans the small decisions —
            what to wear, what to eat, what to buy — so you can focus on everything else.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create your LifeOS <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">I already have an account</Button>
            </Link>
          </div>
        </section>

        <section className="grid w-full grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-in-up rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-4 flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)]">
                <f.icon className="size-4 text-[var(--accent)]" />
              </div>
              <h3 className="mb-1.5 text-sm font-medium">{f.title}</h3>
              <p className="text-[13px] leading-5 text-[var(--muted)]">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mb-24 flex w-full items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-8 py-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Shirt className="size-5 text-[var(--muted)]" />
            <p className="max-w-md text-sm text-[var(--muted)]">
              Build your digital wardrobe once. LifeOS never suggests clothes unsuitable for the weather again.
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="sm">Start onboarding</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted-2)]">
        LifeOS — built for one. Powered by Supabase &amp; OpenAI.
      </footer>
    </div>
  );
}
