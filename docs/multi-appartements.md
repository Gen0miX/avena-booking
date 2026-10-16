# Gestion multi-appartements

Ce document explique comment l'application gère plusieurs appartements (`avena-1`, `avena-2`, ...), comment en ajouter un nouveau, comment déployer les migrations de base de données associées en production, et liste les tests manuels à effectuer avant chaque mise en production touchant ce périmètre.

## 1. Comment ajouter un nouvel appartement

Trois étapes sont nécessaires. Aucune autre modification de code n'est requise : toutes les routes API, tous les hooks et toutes les pages se basent déjà sur `config/apartments.ts` pour généraliser leur comportement à N appartements.

> **Important : le `slug` ne doit jamais changer une fois choisi.** Il sert de clé primaire dans la table `apartments` et de clé étrangère (`apartment_id`) dans `bookings`, `pricing_periods`, `settings` et `promo_code`. Il est aussi utilisé dans les URLs publiques (`/appartements/<slug>`) et potentiellement partagé/indexé. Renommer un slug après coup impose une migration de données manuelle sur toutes ces tables — à éviter.

### a) Déclarer l'appartement dans `config/apartments.ts`

Ce fichier est la **source de vérité unique** pour le contenu et les règles métier de chaque appartement. La base de données ne sait que « l'appartement existe » (voir point c) ; tout le reste (adresse, tarifs, photos, description...) vient d'ici.

Chaque appartement est décrit par un objet qui respecte l'interface `ApartmentConfig` :

- `slug` — identifiant stable et définitif. Dans le code actuel c'est un type littéral `"avena-1" | "avena-2"` : pour ajouter un appartement, il faut d'abord **élargir cette union de types** (ex. `"avena-1" | "avena-2" | "avena-3"`) avant de pouvoir écrire le nouvel objet, sinon TypeScript refusera la compilation.
- `name` — nom affiché (ex. `"Avena 3"`).
- `address` — adresse complète affichée sur la page de l'appartement.
- `mapQuery` — chaîne de recherche utilisée pour la carte Google Maps intégrée (ex. `"Avena, Untere Dorfstrasse 39, 3906 Saas-Fee, Suisse"`).
- `capacity` — nombre maximum de voyageurs (adultes + enfants) pour cet appartement ; sert aussi de borne supérieure pour les paliers tarifaires.
- `minNights` — nombre minimum de nuits pour une réservation.
- `bedrooms` — nombre de chambres (`number`), ou `null` si l'information n'est pas encore connue (l'UI affiche alors un placeholder « à venir » plutôt que de planter).
- `bathrooms` — nombre de salles de bain (`number`), ou `null` dans les mêmes conditions.
- `petsAllowed` — `boolean`, animaux acceptés ou non.
- `defaultRates` — grille tarifaire par défaut, de type `SeasonRates` = `Record<SeasonKey, RateTier[]>`. Les quatre clés de saison (définies dans `lib/pricingPeriods.ts`) sont `basseSaison`, `novembre`, `hiver`, `fetes`. Pour chaque saison, on fournit une liste de **paliers** `RateTier[]`, où chaque palier est `{ minAdults: number; price: number }` : le prix applicable est celui du palier dont le `minAdults` est le plus élevé tout en restant `<=` au nombre d'adultes de la réservation (voir `getTierPrice` dans le même fichier). Le helper `tiers([[minAdults, price], ...])` permet d'écrire ça de façon compacte, par exemple :
  ```ts
  defaultRates: {
    basseSaison: tiers([[1, 150], [3, 200], [5, 250]]),
    novembre: tiers([[1, 250], [5, 250]]),
    hiver: tiers([[1, 280], [5, 300]]),
    fetes: tiers([[1, 350], [5, 400]]),
  },
  ```
  Le dernier palier doit couvrir `capacity` adultes (sinon le prix du dernier palier défini s'applique au-delà, ce qui est généralement correct mais doit être vérifié).
- `gallery` — tableau de `ApartmentGalleryImage` (`{ src: string; alt: string }`), les photos affichées sur la page de l'appartement.
- `amenities` — tableau de chaînes, la liste des équipements affichés (ex. `"Wi-Fi"`, `"Lave-vaisselle"`...).
- `description` — objet `ApartmentDescription` avec les champs `tagline`, `intro`, `capacityIntro`, `features` (`string[]`), `locationIntro`, `winterHighlights` (`string[]`), `summerHighlights` (`string[]`), `locationOutro`. Ce sont les textes affichés sur la page publique de l'appartement.
- `isContentComplete` — `boolean`. Mettre `false` tant que le contenu réel (photos, description, équipements, adresse définitive, tarifs définitifs...) n'est pas finalisé par le client ; l'UI affiche alors des placeholders « contenu à venir » au lieu de planter sur des données vides. Repasser à `true` une fois tout le contenu validé. C'est exactement l'état actuel de `AVENA_2` au moment de la rédaction de ce document : plusieurs champs (`bedrooms`, `bathrooms`, `petsAllowed`, `gallery`, `amenities`, `description`, le palier de prix à 6 personnes) sont encore marqués `TODO(client)`.

Il faut enfin ajouter la nouvelle constante à la map `APARTMENTS` (ex. `"avena-3": AVENA_3`) en bas du fichier — `APARTMENT_LIST`, `getApartmentBySlug` et `isApartmentSlug` en dépendent directement et n'ont besoin d'aucune autre modification.

### b) Ajouter les photos

Déposer les images de l'appartement sous `public/images/appartements/`. Pour un nouvel appartement, il est recommandé de créer un sous-dossier dédié au slug, par exemple `public/images/appartements/avena-3/salon.webp`, afin d'éviter toute collision de nom de fichier avec les autres appartements, puis de référencer ces chemins dans le tableau `gallery` de l'étape (a).

(Note : les photos actuelles d'`avena-1` sont historiquement à plat directement sous `public/images/appartements/` — ex. `public/images/appartements/salon.webp` — sans sous-dossier, car elles ont été ajoutées avant que l'application ne soit multi-appartements. Elles n'ont pas été déplacées pour ne pas casser de chemins existants ; seuls les nouveaux appartements doivent utiliser la convention en sous-dossier.)

### c) Créer les lignes en base de données

Deux lignes sont nécessaires : une dans `apartments`, une dans `settings`. Le style suit exactement celui des migrations de la Tâche 1 (`supabase/migrations/20261016120000_create_apartments.sql` et `20261016120200_seed_avena2_settings.sql`) :

```sql
-- 1. Déclarer l'appartement (id = slug, doit correspondre exactement au `slug`
--    choisi dans config/apartments.ts)
insert into public.apartments (id, name) values
  ('avena-3', 'Avena 3')
on conflict (id) do nothing;

-- 2. Créer sa ligne settings (une ligne par appartement, imposée par
--    l'index unique idx_settings_apartment_id_unique). On reprend la même
--    valeur par défaut que celle en dur dans le code
--    (lib/settings.ts, DEFAULT_BOOKING_BLOCKED_AFTER) pour que le
--    comportement soit identique avec ou sans cette ligne.
insert into public.settings (apartment_id, booking_blocked_after)
values ('avena-3', '2028-10-31')
on conflict (apartment_id) do nothing;
```

Ces deux instructions peuvent être ajoutées dans un nouveau fichier de migration versionné sous `supabase/migrations/<timestamp>_seed_<slug>.sql` (même pattern que `20261016120200_seed_avena2_settings.sql`), pour garder un historique reproductible, plutôt que d'être exécutées à la main uniquement.

Une fois ces trois étapes faites (code + photos + lignes SQL), le nouvel appartement est automatiquement disponible partout : page `/appartements/<slug>`, carte sur la page d'accueil, sélecteur du formulaire de réservation `/booking`, calendrier de disponibilité scopé par appartement, et sélecteur d'appartement de l'admin (bookings, settings, tarifs, périodes personnalisées, statistiques).

## 2. Comment appliquer les migrations en production lors de la mise en production

Trois fichiers de migration ont été créés pour le passage multi-appartements, et doivent être exécutés **dans cet ordre exact** :

1. `supabase/migrations/20261016120000_create_apartments.sql` — crée la table `apartments` et insère `avena-1` et `avena-2`.
2. `supabase/migrations/20261016120100_add_apartment_id.sql` — ajoute la colonne `apartment_id` (+ contrainte de clé étrangère + index) sur `bookings`, `pricing_periods`, `settings` et `promo_code`, et rattache toutes les lignes existantes à `avena-1` par défaut.
3. `supabase/migrations/20261016120200_seed_avena2_settings.sql` — crée la ligne `settings` manquante pour `avena-2`.

**Procédure recommandée, à respecter strictement :**

- Ces trois fichiers doivent d'abord être appliqués sur le projet Supabase de **développement**, puis vérifiés (contrôle manuel des tables `apartments`, `bookings`, `pricing_periods`, `settings`, `promo_code`, et passage de la checklist de tests manuels ci-dessous contre cet environnement de dev).
- Ce n'est **qu'une fois cette vérification en dev confirmée** qu'il faut exécuter les mêmes fichiers, dans le même ordre, contre le projet Supabase de **production** — via `supabase db push` (si le CLI Supabase est relié au projet prod) ou en collant le contenu de chaque fichier dans l'éditeur SQL du dashboard Supabase, dans l'ordre indiqué ci-dessus.
- **Ne jamais exécuter ces migrations contre la base de production avant qu'elles n'aient été vérifiées en dev.** Chaque fichier est écrit pour être « replay-safe » (`if not exists`, `on conflict do nothing`, backfill des lignes existantes) justement pour pouvoir être rejoué sans risque, mais cela ne remplace pas une vérification préalable en dev.

À la date de rédaction de ce document, ces migrations n'ont pas encore été appliquées contre un projet Supabase réel (ni dev ni prod) — le code de l'application a été écrit en anticipant leur application, mais l'exécution effective reste une action manuelle à réaliser et à confirmer séparément, suivant la procédure ci-dessus.

## 3. Liste des tests manuels à effectuer

Checklist reprise verbatim de la Tâche 16 du plan d'implémentation (`docs/superpowers/plans/2026-10-16-multi-apartments.md`), étapes 2 et 3, à exécuter avant chaque mise en production touchant ce périmètre :

**Parité `avena-1` (doit rester rigoureusement identique au comportement pré-migration) :**

- `/appartements/avena-1` affiche exactement le même contenu, la même galerie, les mêmes équipements, la même carte que l'ancienne page `/`.
- Le prix pour une période de dates connue + un nombre d'adultes donné correspond à une valeur enregistrée avant le début de cette migration.
- Le calendrier désactive correctement les dates occupées par les réservations d'`avena-1` uniquement.
- Admin : les onglets réservations/paramètres/périodes tarifaires/statistiques d'`avena-1` affichent les données pré-migration.

**Nouveau comportement `avena-2` :**

- `/appartements/avena-2` s'affiche avec tous les placeholders « à venir », sans planter.
- La réservation sur `avena-2` impose bien une capacité de 6 / un minimum de 2 nuits ; un 7ᵉ voyageur ou un séjour d'une nuit est rejeté à la fois côté client et côté serveur (contourner l'UI avec un `fetch` brut vers `/api/bookings`).
- Une réservation sur `avena-2` n'apparaît pas comme une date occupée dans le calendrier d'`avena-1`, et inversement.
- Un code promo créé pour `avena-1` ne valide pas sur le parcours de réservation d'`avena-2` (et inversement), et le même nom de code peut exister indépendamment sur les deux appartements.
- La création d'une ligne `pricing_periods` pour `avena-2` sur des dates qui ont déjà une période `avena-1` n'est pas rejetée comme un chevauchement.
- Admin « Tous les appartements » : la liste des réservations affiche les deux unités avec une colonne appartement ; les statistiques agrègent les deux.

## 4. Limites connues

### Condition de concurrence (TOCTOU) sur `POST /api/bookings`

La route `POST /api/bookings` effectue la vérification de chevauchement de dates (`SELECT` sur `bookings` scopé par `apartment_id`) et l'insertion de la réservation (`INSERT`) en **deux allers-retours distincts** vers la base de données, sans transaction englobante ni contrainte d'exclusion au niveau PostgreSQL.

**Conséquence pratique :** si deux requêtes de réservation quasi simultanées visent les mêmes dernières dates disponibles sur le même appartement, les deux peuvent passer la vérification de chevauchement (aucune des deux ne voit encore l'insertion de l'autre) et les deux peuvent alors s'insérer en base — un double-booking sur ces dates.

**Pourquoi ce n'est pas corrigé dans le cadre de ce chantier multi-appartements :**

- Ce problème est **préexistant** : l'application mono-appartement avait exactement la même faille, non corrigée, avant cette migration. Il affecte aujourd'hui `avena-1` et `avena-2` de façon identique — ce chantier ne l'a ni introduit, ni aggravé.
- Le plan d'implémentation de ce chantier avait pour contrainte explicite de préserver le comportement existant d'`avena-1` à l'identique, pas d'ajouter de nouvelles garanties que l'application n'offrait jamais auparavant.
- Une correction correcte nécessiterait une contrainte d'exclusion PostgreSQL (`EXCLUDE USING gist`) sur les intervalles de dates par appartement, ce qui suppose d'activer l'extension `btree_gist` sur la base — une évolution de périmètre à part, au-delà de « rendre l'application multi-appartements », qui a été volontairement écartée de ce chantier (constat fait et acté lors de la revue de la Tâche 4, non corrigé par décision explicite).

**Mitigation pratique actuelle :** la fenêtre de risque est étroite (il faut deux requêtes quasi simultanées sur les toutes dernières dates disponibles) et le tableau de bord admin permet déjà de repérer et traiter manuellement une éventuelle collision après coup, via le workflow existant d'annulation/confirmation des réservations (onglet réservations, changement de statut) — cette fonctionnalité n'a pas été ajoutée pour ce cas précis, mais elle suffit à le couvrir en pratique.

**Correction suggérée pour plus tard, si quelqu'un souhaite la commissionner :**

1. Activer l'extension PostgreSQL `btree_gist` sur le projet Supabase (`create extension if not exists btree_gist;`).
2. Ajouter une contrainte d'exclusion sur `bookings`, scopée par appartement et excluant les réservations annulées, du type :
   ```sql
   alter table public.bookings
     add constraint bookings_no_overlap
     exclude using gist (
       apartment_id with =,
       daterange(arrival_date, departure_date, '[)') with &&
     ) where (status != 4);
   ```
3. Adapter `app/api/bookings/route.ts` pour intercepter l'erreur de violation de contrainte renvoyée par Postgres dans ce cas et répondre `409 Conflict` au lieu de laisser remonter une erreur 500 générique.

Cette évolution n'a pas été réalisée dans le cadre du présent chantier et reste à planifier séparément.
