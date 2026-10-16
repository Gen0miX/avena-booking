create table if not exists public.apartments (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.apartments enable row level security;

create policy "Public can read apartments" on public.apartments
  for select using (true);

-- Seed both known apartments. "name" here is just a human-readable label for
-- SQL-side debugging/admin convenience; the real display content (address,
-- gallery, rates, ...) lives in config/apartments.ts, not in this table.
insert into public.apartments (id, name) values
  ('avena-1', 'Avena 1'),
  ('avena-2', 'Avena 2')
on conflict (id) do nothing;
