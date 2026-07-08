# LifeOS — your AI personal life assistant

LifeOS is a polished, dark-mode-first web app that plans your **meals, outfits and daily routine**.
It learns your goals, wardrobe and budget, checks the weather every morning, and quietly handles the
small decisions — what to wear, what to eat, what to buy — so you don't have to.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase** (Postgres +
Auth + Storage) and the **OpenAI API**. The design language is intentionally minimal and premium,
in the spirit of Apple and Linear.

> There's also a `legacy-telegram-bot/` folder containing the original "Arnold" Telegram-bot prototype
> this project grew out of. It's kept for reference and is not part of the web app.

---

## Features

**Onboarding**
- Guided multi-step questionnaire: personal details, goals, food preferences, lifestyle and a digital wardrobe builder.
- Automatically estimates your daily calorie and protein targets (Mifflin-St Jeor + activity + goal).

**Dashboard**
- Personalised `Good morning, {name}` greeting with an AI-written daily summary.
- Beautiful cards: live weather, today's outfit, today's meals, calories & protein rings, today's spending,
  weekly budget remaining, shopping reminders, hydration tracker and step goal.

**Weather-aware outfits**
- Fetches the forecast each morning (temperature, feels-like, wind, rain %, humidity, UV, sunrise/sunset).
- A rule-based engine picks a top, bottom, shoes, jacket and accessories **only from your wardrobe**,
  matched to warmth, season and rain — then OpenAI explains *why* in plain language.
- Never recommends clothes unsuitable for the weather; prefers waterproof items when rain is likely.

**Meal planner**
- Generates breakfast, lunch, dinner and a snack that hit your calorie/protein targets and stay within budget.
- Avoids disliked foods, allergies and "never recommend" items, reuses ingredients and uses pantry stock.
- Every meal shows ingredients, recipe, calories, protein, cost, prep time and cook time, plus daily totals.

**Shopping list**
- Auto-built from your meal plan, organised by aisle (Fruit & Veg, Meat, Frozen, Dairy, Bakery, Drinks, Household).
- Check items off, add your own, see an estimated total, and print a clean copy.

**Budget system**
- Tracks weekly food budget, money spent, money remaining and average daily spend.
- Warns you when you're trending over budget, with a daily spend-vs-target chart.

**AI memory**
- Learns from your feedback over time: dislike a meal and its ingredients get down-weighted; swap an outfit
  piece and that preference is remembered. Learned preferences are visible and editable in Settings.

**Extras**
- Grocery expiry tracker with AI leftover suggestions, weekly meal calendar strip, weight tracker with a
  progress chart, hydration & step history charts, printable shopping list and a daily AI summary.

**Settings**
- Edit everything from onboarding any time, plus units, currency, theme (dark/light), water & step goals.

---

## Getting started

### 1. Prerequisites
- Node.js **20.9+**
- A free [Supabase](https://supabase.com) project
- (Optional) an [OpenAI API key](https://platform.openai.com) — the app works without it using built-in fallbacks

### 2. Install

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values (see the file for details):

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `http://localhost:3000` in dev; your deployed URL in prod |
| `OPENAI_API_KEY` | optional | Enables real AI meal plans, outfit reasoning & summaries |
| `OPENAI_MODEL` | optional | Defaults to `gpt-4o-mini` |
| `OPENWEATHER_API_KEY` | optional | Falls back to the free, no-key Open-Meteo API |

### 4. Set up the database

Open the **SQL editor** in your Supabase dashboard, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) and run it. This is idempotent and safe to re-run — it creates:

- All tables (profiles, food preferences, lifestyle, wardrobe, meals, shopping, budget, trackers, AI memory, …)
- **Row Level Security** policies so each user can only ever read/write their own rows
- A trigger that auto-creates a `profiles` row on signup
- A public **`wardrobe-photos`** storage bucket with per-user upload policies

### 5. Configure Supabase Auth
- **Authentication → URL Configuration**: add `http://localhost:3000/auth/callback` (and your production
  callback) to the **Redirect URLs**.
- For quick local testing you can disable "Confirm email" under **Authentication → Providers → Email**,
  otherwise new users must confirm via the emailed link before logging in.

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and you'll be guided through
onboarding into your dashboard.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Project structure

```
src/
  app/
    (auth)/            # login, signup, reset & update password + server actions
    (app)/             # authenticated shell: dashboard, meals, wardrobe,
                       #   shopping, budget, progress, settings
    onboarding/        # first-run questionnaire
    auth/callback/     # Supabase email/reset callback route handler
    api/               # route handlers: meals, outfit, shopping, water,
                       #   steps, weight, spending, pantry, summary
  components/          # UI primitives + feature components (dashboard, meals,
                       #   wardrobe, shopping, budget, progress, settings)
  lib/
    supabase/          # browser, server & proxy clients
    ai/                # outfit engine, meal planner, memory, summary, leftovers
    data/              # server-side data helpers (weather, meals, budget, …)
    database.types.ts  # typed schema matching supabase/schema.sql
supabase/schema.sql    # full database schema + RLS + storage setup
```

### How authentication is protected
`src/proxy.ts` (Next.js 16's renamed middleware) refreshes the Supabase session on every request and
redirects unauthenticated users away from protected routes. The `(app)` layout additionally gates on
`onboarding_completed`, so new users always finish onboarding first.

### Graceful degradation
Every AI feature has a deterministic fallback. Without `OPENAI_API_KEY` you still get a real meal plan,
outfit reasoning and daily summary from built-in templates. Without `OPENWEATHER_API_KEY` the app uses the
free Open-Meteo API, so weather and outfits work with **zero paid keys** — only Supabase is strictly required.

---

## Deployment

Deploy to any Node host or Vercel. Set the same environment variables in your host's dashboard, point
`NEXT_PUBLIC_SITE_URL` at your deployed URL, add the production `/auth/callback` URL to Supabase's
redirect list, and run `supabase/schema.sql` against your production database.
