-- ============================================================================
-- LifeOS database schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: one row per user, created automatically on signup
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  age int,
  height_cm numeric,
  weight_kg numeric,
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text check (goal in ('lose_fat', 'build_muscle', 'maintain')),
  daily_calorie_target int,
  daily_protein_target numeric,
  water_goal_ml int default 2500,
  step_goal int default 8000,
  location_name text,
  latitude numeric,
  longitude numeric,
  timezone text default 'Europe/London',
  units text default 'metric' check (units in ('metric', 'imperial')),
  currency text default 'GBP' check (currency in ('GBP', 'USD', 'EUR')),
  theme text default 'dark' check (theme in ('dark', 'light')),
  onboarding_completed boolean default false,
  onboarding_step int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- food_preferences
-- ----------------------------------------------------------------------------
create table if not exists public.food_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  weekly_food_budget numeric default 60,
  favourite_foods text[] default '{}',
  disliked_foods text[] default '{}',
  never_recommend text[] default '{}',
  allergies text[] default '{}',
  dietary_requirements text[] default '{}',
  favourite_supermarkets text[] default '{}',
  cooking_ability text check (cooking_ability in ('beginner', 'intermediate', 'confident', 'advanced')) default 'intermediate',
  kitchen_appliances text[] default '{}',
  preferred_meal_times jsonb default '{"breakfast":"08:00","lunch":"13:00","dinner":"19:00","snack":"16:00"}',
  favourite_drinks text[] default '{}',
  favourite_snacks text[] default '{}',
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- lifestyle
-- ----------------------------------------------------------------------------
create table if not exists public.lifestyle (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  wake_time time default '07:00',
  bedtime time default '23:00',
  work_schedule text,
  daily_activity text,
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- wardrobe_items
-- ----------------------------------------------------------------------------
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  category text not null check (category in (
    't_shirts', 'shirts', 'hoodies', 'jackets', 'jumpers',
    'jeans', 'trousers', 'shorts', 'trainers', 'boots', 'accessories'
  )),
  colour text,
  season text check (season in ('spring', 'summer', 'autumn', 'winter', 'all_season')) default 'all_season',
  warmth_rating int check (warmth_rating between 1 and 5) default 3,
  waterproof boolean default false,
  photo_url text,
  times_worn int default 0,
  last_worn_at date,
  created_at timestamptz default now()
);

create index if not exists wardrobe_items_user_id_idx on public.wardrobe_items (user_id);

-- ----------------------------------------------------------------------------
-- outfit_recommendations
-- ----------------------------------------------------------------------------
create table if not exists public.outfit_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  weather_snapshot jsonb,
  top_item_id uuid references public.wardrobe_items (id) on delete set null,
  bottom_item_id uuid references public.wardrobe_items (id) on delete set null,
  shoes_item_id uuid references public.wardrobe_items (id) on delete set null,
  jacket_item_id uuid references public.wardrobe_items (id) on delete set null,
  accessory_item_ids uuid[] default '{}',
  reasoning text,
  edited boolean default false,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ----------------------------------------------------------------------------
-- meal_plans / meal_plan_items
-- ----------------------------------------------------------------------------
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  total_calories int default 0,
  total_protein numeric default 0,
  total_cost numeric default 0,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  ingredients jsonb default '[]',
  recipe text,
  calories int default 0,
  protein numeric default 0,
  cost numeric default 0,
  prep_time_minutes int default 0,
  cook_time_minutes int default 0,
  is_leftover boolean default false,
  liked boolean,
  created_at timestamptz default now()
);

create index if not exists meal_plan_items_plan_id_idx on public.meal_plan_items (meal_plan_id);

-- ----------------------------------------------------------------------------
-- shopping_list_items
-- ----------------------------------------------------------------------------
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null default current_date,
  name text not null,
  category text not null check (category in (
    'fruit_veg', 'meat', 'frozen', 'dairy', 'bakery', 'drinks', 'household', 'other'
  )),
  quantity text,
  estimated_cost numeric default 0,
  checked boolean default false,
  created_at timestamptz default now()
);

create index if not exists shopping_list_items_user_week_idx on public.shopping_list_items (user_id, week_start);

-- ----------------------------------------------------------------------------
-- spending_log
-- ----------------------------------------------------------------------------
create table if not exists public.spending_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null,
  description text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- pantry / grocery expiry tracker
-- ----------------------------------------------------------------------------
create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  quantity text,
  category text,
  expiry_date date,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- trackers: weight / water / steps
-- ----------------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  weight_kg numeric not null,
  logged_at date not null default current_date,
  unique (user_id, logged_at)
);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount_ml int not null,
  logged_at date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists public.step_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  steps int not null,
  logged_at date not null default current_date,
  unique (user_id, logged_at)
);

-- ----------------------------------------------------------------------------
-- ai_memory: learned preferences over time
-- ----------------------------------------------------------------------------
create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('food', 'outfit', 'style')),
  key text not null,
  sentiment text not null check (sentiment in ('liked', 'disliked', 'ignored')),
  weight int not null default 1,
  updated_at timestamptz default now(),
  unique (user_id, category, key)
);

-- ----------------------------------------------------------------------------
-- daily_summaries: AI-generated daily recap
-- ----------------------------------------------------------------------------
create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  summary text not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ----------------------------------------------------------------------------
-- weather_cache: avoid re-fetching the provider multiple times a day
-- ----------------------------------------------------------------------------
create table if not exists public.weather_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  data jsonb not null,
  fetched_at timestamptz default now(),
  unique (user_id, date)
);

-- ============================================================================
-- Row Level Security: every table is owned by a single user
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.food_preferences enable row level security;
alter table public.lifestyle enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.outfit_recommendations enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.spending_log enable row level security;
alter table public.pantry_items enable row level security;
alter table public.weight_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.step_logs enable row level security;
alter table public.ai_memory enable row level security;
alter table public.daily_summaries enable row level security;
alter table public.weather_cache enable row level security;

do $$
declare
  t text;
  owner_col text;
begin
  for t, owner_col in
    select unnest(array[
      'food_preferences', 'lifestyle', 'wardrobe_items', 'outfit_recommendations',
      'meal_plans', 'meal_plan_items', 'shopping_list_items', 'spending_log',
      'pantry_items', 'weight_logs', 'water_logs', 'step_logs', 'ai_memory',
      'daily_summaries', 'weather_cache'
    ]), unnest(array[
      'user_id', 'user_id', 'user_id', 'user_id',
      'user_id', 'user_id', 'user_id', 'user_id',
      'user_id', 'user_id', 'user_id', 'user_id', 'user_id',
      'user_id', 'user_id'
    ])
  loop
    execute format(
      'drop policy if exists "own rows" on public.%I;
       create policy "own rows" on public.%I for all using (auth.uid() = %I) with check (auth.uid() = %I);',
      t, t, owner_col, owner_col
    );
  end loop;
end $$;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================================
-- Auto-create a profile row whenever a new auth user signs up
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Storage: wardrobe photos
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('wardrobe-photos', 'wardrobe-photos', true)
on conflict (id) do nothing;

drop policy if exists "wardrobe photos are publicly readable" on storage.objects;
create policy "wardrobe photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'wardrobe-photos');

drop policy if exists "users manage their own wardrobe photos" on storage.objects;
create policy "users manage their own wardrobe photos"
  on storage.objects for all
  using (bucket_id = 'wardrobe-photos' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'wardrobe-photos' and auth.uid()::text = (storage.foldername(name))[1]);
