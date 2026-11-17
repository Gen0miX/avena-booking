-- Codes promo par période (ex. saison d'hiver du 01.12 au 30.04).
--   valid_from / valid_to : première et dernière nuit couvertes par le code.
--   Le code s'applique si toutes les nuits du séjour sont dans la période.
--
-- Rétrocompatibilité : les codes existants gardent valid_from / valid_to à
-- NULL et restent validés par l'ancienne règle (mois encodé dans les trois
-- premières lettres du nom, cf. lib/promo.ts). Colonnes facultatives : la
-- version déjà déployée continue de fonctionner pendant la mise en prod.
-- Replay-safe.

alter table public.promo_code
  add column if not exists valid_from date,
  add column if not exists valid_to date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'promo_code_validity_period_check'
  ) then
    alter table public.promo_code
      add constraint promo_code_validity_period_check
      check (
        (valid_from is null and valid_to is null)
        or (valid_from is not null and valid_to is not null and valid_from <= valid_to)
      );
  end if;
end $$;
