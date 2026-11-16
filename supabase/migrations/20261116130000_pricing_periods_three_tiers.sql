-- Périodes spéciales : trois paliers de prix par nombre total de personnes
-- (enfants compris), comme la grille saisonnière de config/apartments.ts :
--   price_up_to_2  jusqu'à 2 personnes
--   price_up_to_4  jusqu'à 4 personnes
--   price_up_to_6  jusqu'à 6 personnes (borné par la capacité de l'appartement)
--
-- Reprise des périodes existantes (ancien modèle à 2 prix) :
--   price_standard -> jusqu'à 2 et jusqu'à 4 personnes
--   price_five     -> jusqu'à 6 personnes
-- Les anciennes colonnes sont conservées (rendues facultatives) pour ne pas
-- casser une version déjà déployée ; elles ne sont plus lues par le code et
-- pourront être supprimées plus tard. Replay-safe.

alter table public.pricing_periods
  add column if not exists price_up_to_2 integer,
  add column if not exists price_up_to_4 integer,
  add column if not exists price_up_to_6 integer;

update public.pricing_periods
set
  price_up_to_2 = coalesce(price_up_to_2, price_standard),
  price_up_to_4 = coalesce(price_up_to_4, price_standard),
  price_up_to_6 = coalesce(price_up_to_6, price_five)
where price_up_to_2 is null or price_up_to_4 is null or price_up_to_6 is null;

alter table public.pricing_periods
  alter column price_up_to_2 set not null,
  alter column price_up_to_4 set not null,
  alter column price_up_to_6 set not null,
  alter column price_standard drop not null,
  alter column price_five drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pricing_periods_tier_prices_positive'
  ) then
    alter table public.pricing_periods
      add constraint pricing_periods_tier_prices_positive
      check (price_up_to_2 > 0 and price_up_to_4 > 0 and price_up_to_6 > 0);
  end if;
end $$;
