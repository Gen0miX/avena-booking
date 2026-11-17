-- Permet à l'admin connecté de créer, modifier et supprimer des codes promo
-- depuis le dashboard. Jusqu'ici, promo_code n'avait qu'une policy de
-- lecture : toute écriture était refusée par RLS.
-- Même modèle que pricing_periods ("Authenticated users can manage ...").
-- Replay-safe.

drop policy if exists "Authenticated users can manage promo codes" on public.promo_code;

create policy "Authenticated users can manage promo codes"
  on public.promo_code
  for all
  to authenticated
  using (true)
  with check (true);
