-- ============================================================================
-- Fausses données pour la base de DÉVELOPPEMENT (avena-booking-dev)
--
-- À exécuter dans le SQL Editor du projet Supabase de dev, APRÈS les
-- migrations multi-appartements (tables apartments + colonnes apartment_id).
-- NE JAMAIS exécuter sur la production.
--
-- - Les dates sont calculées depuis current_date : les données restent
--   pertinentes quel que soit le jour où le script est lancé.
-- - Les prix sont calculés nuit par nuit avec les tarifs saisonniers de
--   config/apartments.ts (mêmes saisons que getSeasonKeyForDate).
-- - Aucune réservation ne se chevauche sur un même appartement.
-- - Rejouable : les données de test précédentes sont supprimées d'abord.
--   Elles sont reconnaissables à :
--     bookings        -> mail en @exemple.test
--     pricing_periods -> nom se terminant par « (test) »
--     promo_code      -> nom contenant TEST
-- ============================================================================

begin;

-- Statuts attendus par l'application (sans effet s'ils existent déjà)
insert into public.status (id, name)
overriding system value
values (1, 'En attente'), (2, 'Confirmée'), (3, 'Terminée'), (4, 'Annulée')
on conflict (id) do nothing;

-- Nettoyage des données de test précédentes
delete from public.bookings where mail like '%@exemple.test';
delete from public.pricing_periods where name like '% (test)';
delete from public.promo_code where name like '%TEST%';

-- ---------------------------------------------------------------------------
-- Réservations
--   arrival_offset : jours depuis aujourd'hui (négatif = passé)
--   status : 1 En attente, 2 Confirmée, 3 Terminée, 4 Annulée
-- ---------------------------------------------------------------------------
with seed (apartment_id, fname, lname, city, postal_code, arrival_offset, nights, adults, children, status, is_paid) as (
  values
    -- Avena 1 (5 personnes max) — séjours passés
    ('avena-1', 'Claire',   'Morand',    'Sion',       '1950', -340, 7, 2, 2, 3, true),
    ('avena-1', 'Lukas',    'Brunner',   'Zürich',     '8001', -300, 4, 3, 1, 3, true),
    ('avena-1', 'Sophie',   'Favre',     'Lausanne',   '1003', -265, 3, 2, 0, 3, true),
    ('avena-1', 'Andrea',   'Rossi',     'Lugano',     '6900', -230, 7, 5, 0, 3, true),
    ('avena-1', 'Marc',     'Girard',    'Genève',     '1201', -200, 5, 4, 0, 3, true),
    ('avena-1', 'Emma',     'Keller',    'Bern',       '3011', -170, 3, 2, 2, 3, true),
    ('avena-1', 'Julien',   'Perrin',    'Neuchâtel',  '2000', -150, 3, 2, 0, 4, false),
    ('avena-1', 'Nina',     'Schmid',    'Basel',      '4051', -140, 6, 4, 1, 3, true),
    ('avena-1', 'Thomas',   'Bonvin',    'Sierre',     '3960', -110, 2, 2, 0, 3, true),
    ('avena-1', 'Laura',    'Meier',     'Luzern',     '6003',  -85, 4, 3, 0, 3, true),
    ('avena-1', 'Pierre',   'Dubois',    'Fribourg',   '1700',  -60, 7, 2, 2, 3, true),
    ('avena-1', 'Sara',     'Fontana',   'Bellinzona', '6500',  -35, 3, 2, 0, 3, true),
    ('avena-1', 'Yann',     'Michaud',   'Vevey',      '1800',  -14, 5, 5, 0, 3, true),
    -- Avena 1 — à venir
    ('avena-1', 'Élodie',   'Roux',      'Montreux',   '1820',    1, 3, 2, 0, 2, false),
    ('avena-1', 'David',    'Huber',     'St. Gallen', '9000',   10, 4, 3, 1, 2, true),
    ('avena-1', 'Camille',  'Lambert',   'Nyon',       '1260',   25, 3, 2, 0, 1, false),
    ('avena-1', 'Marco',    'Bernasconi','Locarno',    '6600',   45, 7, 5, 0, 1, false),
    ('avena-1', 'Anna',     'Weber',     'Winterthur', '8400',   70, 5, 4, 0, 2, false),
    ('avena-1', 'Louis',    'Chappuis',  'Yverdon',    '1400',  100, 7, 2, 3, 1, false),
    ('avena-1', 'Lea',      'Zimmermann','Thun',       '3600',  130, 4, 2, 1, 2, true),

    -- Avena 2 (6 personnes max) — séjours passés
    ('avena-2', 'Hugo',     'Bertrand',  'Martigny',   '1920', -320, 5, 6, 0, 3, true),
    ('avena-2', 'Mia',      'Fischer',   'Zug',        '6300', -250, 7, 4, 2, 3, true),
    ('avena-2', 'Olivier',  'Rey',       'Monthey',    '1870', -190, 4, 3, 0, 3, true),
    ('avena-2', 'Chiara',   'Ferrari',   'Mendrisio',  '6850', -120, 6, 5, 1, 3, true),
    ('avena-2', 'Noah',     'Steiner',   'Aarau',      '5000',  -95, 2, 2, 0, 4, false),
    ('avena-2', 'Manon',    'Gay',       'Bulle',      '1630',  -75, 3, 2, 2, 3, true),
    ('avena-2', 'Felix',    'Baumann',   'Chur',       '7000',  -40, 7, 6, 0, 3, true),
    ('avena-2', 'Inès',     'Moreau',    'Morges',     '1110',  -20, 4, 4, 0, 3, true),
    -- Avena 2 — à venir
    ('avena-2', 'Jonas',    'Graf',      'Olten',      '4600',    5, 4, 3, 2, 2, true),
    ('avena-2', 'Alice',    'Vuilleumier','La Chaux-de-Fonds','2300', 18, 3, 2, 0, 1, false),
    ('avena-2', 'Matteo',   'Colombo',   'Chiasso',    '6830',   40, 6, 6, 0, 2, false),
    ('avena-2', 'Zoé',      'Pittet',    'Renens',     '1020',   90, 7, 4, 2, 1, false),
    ('avena-2', 'Simon',    'Wyss',      'Biel/Bienne','2502',  150, 5, 5, 1, 1, false)
),
dated as (
  select
    s.*,
    current_date + s.arrival_offset as arrival_date,
    current_date + s.arrival_offset + s.nights as departure_date,
    row_number() over () as n
  from seed s
)
insert into public.bookings (
  apartment_id, created_at, fname, lname, mail, phone,
  address, postal_code, city, birthdate,
  no_adults, no_childs, status, arrival_date, departure_date,
  price, is_cleaning, is_paid
)
select
  d.apartment_id,
  -- demande reçue 10 à 45 jours avant l'arrivée, jamais dans le futur
  least(now(), d.arrival_date - (10 + (d.n * 7) % 36) * interval '1 day'),
  d.fname,
  d.lname,
  lower(translate(d.fname || '.' || d.lname, 'ÉéèêëÏïÎîÔôÖöÜüÛûÀàÂâÇç ', 'eeeeeiiiioooouuuuaaaacc')) || '@exemple.test',
  '+41 79 000 ' || lpad((10 + d.n)::text, 2, '0') || ' ' || lpad((d.n * 3 % 100)::text, 2, '0'),
  'Rue de l''Exemple ' || (d.n * 3),
  d.postal_code,
  d.city,
  make_date((1960 + (d.n * 7) % 40)::int, (1 + d.n % 12)::int, (1 + (d.n * 5) % 28)::int),
  d.adults,
  d.children,
  d.status,
  d.arrival_date,
  d.departure_date,
  (
    -- Tarif par nuit selon la saison et le nombre d'adultes
    -- (Avena 2 : le palier 6 personnes est aligné sur celui de 5)
    select sum(
      case
        when (extract(month from night) = 12 and extract(day from night) >= 18)
          or (extract(month from night) = 1 and extract(day from night) <= 10)
          then case when d.adults >= 5 then 400 else 350 end           -- Fêtes
        when (extract(month from night) = 1)
          or extract(month from night) between 2 and 4
          or extract(month from night) = 12
          then case when d.adults >= 5 then 300 else 280 end           -- Hiver
        when extract(month from night) = 11
          then 250                                                      -- Novembre
        else case when d.adults >= 5 then 250
                  when d.adults >= 3 then 200
                  else 150 end                                          -- Basse saison
      end
    )
    from generate_series(d.arrival_date, d.departure_date - 1, interval '1 day') as night
  ),
  true,
  d.is_paid
from dated d;

-- ---------------------------------------------------------------------------
-- Périodes tarifaires spéciales (placées après les réservations de test)
-- ---------------------------------------------------------------------------
insert into public.pricing_periods (apartment_id, name, start_date, end_date, price_standard, price_five)
values
  ('avena-1', 'Festival (test)',      current_date + 200, current_date + 207, 320, 380),
  ('avena-1', 'Week-end long (test)', current_date + 230, current_date + 240, 300, 340),
  ('avena-2', 'Festival (test)',      current_date + 200, current_date + 207, 330, 390);

-- ---------------------------------------------------------------------------
-- Codes promo : le préfixe doit être le mois du séjour (cf. lib/promo.ts)
-- ---------------------------------------------------------------------------
insert into public.promo_code (apartment_id, name, percentage, active)
values
  ('avena-1', to_char(current_date + interval '1 month', 'MON') || 'TEST10', 10, true),
  ('avena-1', to_char(current_date + interval '2 month', 'MON') || 'TEST15', 15, false),
  ('avena-2', to_char(current_date + interval '1 month', 'MON') || 'TEST10', 10, true);

commit;

-- Contrôle rapide
select apartment_id, s.name as statut, count(*) as reservations, sum(price) as total_chf
from public.bookings b
join public.status s on s.id = b.status
where mail like '%@exemple.test'
group by apartment_id, s.name
order by apartment_id, s.name;

-- ---------------------------------------------------------------------------
-- Pour tout supprimer plus tard :
--   delete from public.bookings where mail like '%@exemple.test';
--   delete from public.pricing_periods where name like '% (test)';
--   delete from public.promo_code where name like '%TEST%';
-- ---------------------------------------------------------------------------
