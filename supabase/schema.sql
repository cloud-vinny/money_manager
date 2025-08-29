-- Enable pgcrypto for gen_random_uuid (if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table if not exists profiles (
  id uuid primary key,
  created_at timestamptz default now()
);

create table if not exists periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  month_start date not null,
  unique(user_id, month_start)
);

create table if not exists incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  note text,
  created_at timestamptz default now()
);

-- One-off spending (per month)
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  merchant text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  category text,
  created_at timestamptz default now()
);

-- One-off savings transfers (per month)
create table if not exists savings_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  note text,
  created_at timestamptz default now()
);

-- One-off investment trades (per month)
create table if not exists investment_trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  note text,
  created_at timestamptz default now()
);

-- Global recurring allocations (no monthly reset)
-- kind: 'savings' | 'investment' | 'spend'
create table if not exists recurring_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('savings','investment','spend')),
  amount_cents bigint not null check (amount_cents >= 0),
  active boolean not null default true,
  created_at timestamptz default now(),
  unique(user_id, kind)
);

-- Helper views for current month totals
create or replace view v_month_totals as
  select p.id as period_id,
         p.user_id,
         p.month_start,
         coalesce((select sum(amount_cents) from incomes i where i.period_id=p.id),0) as income_cents,
         coalesce((select sum(amount_cents) from expenses e where e.period_id=p.id),0) as expense_cents,
         coalesce((select sum(amount_cents) from savings_transfers s where s.period_id=p.id),0) as savings_oneoff_cents,
         coalesce((select sum(amount_cents) from investment_trades t where t.period_id=p.id),0) as invest_oneoff_cents
  from periods p;
