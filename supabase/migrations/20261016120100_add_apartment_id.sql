-- bookings
alter table public.bookings add column if not exists apartment_id text;
update public.bookings set apartment_id = 'avena-1' where apartment_id is null;
alter table public.bookings alter column apartment_id set not null;
alter table public.bookings
  add constraint bookings_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
create index if not exists idx_bookings_apartment_id on public.bookings (apartment_id);

-- pricing_periods
alter table public.pricing_periods add column if not exists apartment_id text;
update public.pricing_periods set apartment_id = 'avena-1' where apartment_id is null;
alter table public.pricing_periods alter column apartment_id set not null;
alter table public.pricing_periods
  add constraint pricing_periods_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
create index if not exists idx_pricing_periods_apartment_id on public.pricing_periods (apartment_id);

-- settings
alter table public.settings add column if not exists apartment_id text;
update public.settings set apartment_id = 'avena-1' where apartment_id is null;
alter table public.settings alter column apartment_id set not null;
alter table public.settings
  add constraint settings_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
-- exactly one settings row per apartment
create unique index if not exists idx_settings_apartment_id_unique on public.settings (apartment_id);

-- promo_code
alter table public.promo_code add column if not exists apartment_id text;
update public.promo_code set apartment_id = 'avena-1' where apartment_id is null;
alter table public.promo_code alter column apartment_id set not null;
alter table public.promo_code
  add constraint promo_code_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
create index if not exists idx_promo_code_apartment_id on public.promo_code (apartment_id);
-- a code name is unique per apartment, not globally; case-insensitive to match
-- the existing .ilike() lookup in app/api/promo/validate/route.ts
create unique index if not exists idx_promo_code_apartment_name_unique
  on public.promo_code (apartment_id, upper(name));
