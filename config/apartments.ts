import { SeasonKey } from "@/lib/pricingPeriods";

export interface RateTier {
  /** Nombre total de personnes (adultes + enfants) à partir duquel ce prix s'applique. */
  minGuests: number;
  price: number;
}

export type SeasonRates = Record<SeasonKey, RateTier[]>;

export interface ApartmentGalleryImage {
  src: string;
  alt: string;
}

export interface ApartmentDescription {
  tagline: string;
  intro: string;
  capacityIntro: string;
  features: string[];
  locationIntro: string;
  winterHighlights: string[];
  summerHighlights: string[];
  locationOutro: string;
}

export interface ApartmentConfig {
  slug: "avena-1" | "avena-2";
  name: string;
  address: string;
  mapQuery: string;
  capacity: number; // max total travelers (adults + children), also the top pricing tier
  minNights: number;
  bedrooms: number | null;
  bathrooms: number | null;
  petsAllowed: boolean;
  defaultRates: SeasonRates;
  gallery: ApartmentGalleryImage[];
  amenities: string[];
  description: ApartmentDescription;
  /** false => UI must render "contenu à venir" placeholders instead of crashing on empty data. */
  isContentComplete: boolean;
}

function tiers(entries: [number, number][]): RateTier[] {
  return entries.map(([minGuests, price]) => ({ minGuests, price }));
}

// Grille commune aux deux appartements (client, novembre 2026). Le palier
// dépend du nombre total de personnes, enfants compris.
const SHARED_RATES: SeasonRates = {
  // Décembre – avril
  hiver: tiers([
    [1, 200], // jusqu'à 2 personnes
    [3, 280], // jusqu'à 4 personnes
    [5, 320], // jusqu'à 6 personnes
  ]),
  // Mai – novembre
  ete: tiers([
    [1, 150],
    [3, 280],
    [5, 320],
  ]),
};

export const AVENA_1: ApartmentConfig = {
  slug: "avena-1",
  name: "Avena 1",
  address: "Untere Dorfstrasse 39, 3906 Saas-Fee",
  mapQuery: "Avena, Untere Dorfstrasse 39, 3906 Saas-Fee, Suisse",
  capacity: 5,
  minNights: 2,
  bedrooms: 2,
  bathrooms: 1,
  petsAllowed: false,
  defaultRates: SHARED_RATES,
  gallery: [
    { src: "/images/appartements/salon.webp", alt: "Salon" },
    { src: "/images/appartements/cuisine.webp", alt: "Cuisine" },
    { src: "/images/appartements/chambre1.webp", alt: "Chambre 1" },
    { src: "/images/appartements/chambre2.webp", alt: "Chambre 2" },
    { src: "/images/appartements/balcony.webp", alt: "Balcon" },
  ],
  amenities: [
    "Wi-Fi",
    "Écran",
    "Four",
    "Frigo",
    "Plaques",
    "Machine Nespresso",
    "Lave-vaisselle",
    "Salle de bain (douche)",
    "Rangements",
    "Sèche-cheveux",
    "Balcon",
    "Non-fumeur",
  ],
  description: {
    tagline: "Un séjour comme à la maison, à Saas-Fee",
    intro:
      "Vous cherchez une location d'appartement à Saas-Fee pour vos prochaines vacances en montagne ? Découvrez notre hébergement tout confort situé à Untere Dorfstrasse 39, en plein cœur de la station piétonne de Saas-Fee, dans les Alpes valaisannes.",
    capacityIntro:
      "Cet appartement lumineux peut accueillir jusqu'à 5 personnes et dispose de :",
    features: [
      "Deux chambres spacieuses avec literie de qualité (possibilité d'ajouter un matelas et un duvet pour une 5ᵉ personne)",
      "Un salon chaleureux avec coin repas",
      "Une cuisine équipée (four, plaques, lave-vaisselle, machine à café)",
      "Une salle de bain",
      "Wi-Fi gratuit, écran, linge de lit et serviettes inclus",
    ],
    locationIntro:
      "Située à 1800 mètres d'altitude, Saas-Fee est une destination de choix pour un séjour en montagne en toute saison.",
    winterHighlights: [
      "Plus de 100 km de pistes de ski",
      "Snowpark, ski de fond, randonnées en raquettes",
      "Patinoire, pistes de luge, paysages enneigés à couper le souffle",
    ],
    summerHighlights: [
      "Randonnées panoramiques dans les Alpes suisses",
      "Activités en plein air : VTT, via ferrata, tyrolienne",
      "Découverte du patrimoine local et gastronomie valaisanne",
    ],
    locationOutro:
      "Notre appartement bénéficie d'un emplacement central idéal, à seulement 5 minutes à pied de l'arrêt de bus et 10 minutes du parking principal. Vous pouvez ainsi profiter pleinement de tout ce que Saas-Fee a à offrir, sans contrainte de transport.",
  },
  isContentComplete: true,
};

export const AVENA_2: ApartmentConfig = {
  slug: "avena-2",
  name: "Avena 2",
  // TODO(client): confirmer l'adresse exacte de ce 2e appartement dans l'immeuble.
  address: "Untere Dorfstrasse 39, 3906 Saas-Fee",
  mapQuery: "Avena, Untere Dorfstrasse 39, 3906 Saas-Fee, Suisse",
  capacity: 6,
  minNights: 2,
  bedrooms: 3,
  bathrooms: 1, // + un WC séparé (précisé dans la description)
  petsAllowed: false, // TODO(client): confirmer
  defaultRates: SHARED_RATES,
  gallery: [], // TODO(client): photos à ajouter (la galerie affiche « Photos à venir »)
  // Mêmes équipements qu'Avena 1 pour l'instant (décision client), à compléter si besoin.
  amenities: [...AVENA_1.amenities],
  description: {
    tagline: "Un séjour comme à la maison, à Saas-Fee",
    intro:
      "Vous cherchez une location d'appartement à Saas-Fee pour des vacances en famille ou entre amis ? Découvrez notre second hébergement tout confort situé à Untere Dorfstrasse 39, en plein cœur de la station piétonne de Saas-Fee, dans les Alpes valaisannes.",
    capacityIntro:
      "Cet appartement spacieux peut accueillir jusqu'à 6 personnes et dispose de :",
    features: [
      "Trois chambres avec literie de qualité",
      "Un salon chaleureux avec coin repas",
      "Une cuisine équipée (four, plaques, lave-vaisselle, machine à café)",
      "Une salle de bain avec WC, plus un WC séparé",
      "Wi-Fi gratuit, écran, linge de lit et serviettes inclus",
    ],
    // Même immeuble : textes de localisation identiques à Avena 1.
    locationIntro: AVENA_1.description.locationIntro,
    winterHighlights: [...AVENA_1.description.winterHighlights],
    summerHighlights: [...AVENA_1.description.summerHighlights],
    locationOutro: AVENA_1.description.locationOutro,
  },
  // Textes complets ; seules les photos manquent encore.
  isContentComplete: true,
};

export const APARTMENTS = {
  "avena-1": AVENA_1,
  "avena-2": AVENA_2,
} as const;

export type ApartmentSlug = keyof typeof APARTMENTS;
export const APARTMENT_LIST: ApartmentConfig[] = Object.values(APARTMENTS);

export function getApartmentBySlug(slug: string): ApartmentConfig | undefined {
  return (APARTMENTS as Record<string, ApartmentConfig>)[slug];
}

export function isApartmentSlug(slug: string): slug is ApartmentSlug {
  return slug in APARTMENTS;
}

export interface RateTableColumn {
  label: string;
  minGuests: number;
  maxGuests: number;
}

/**
 * Colonnes des tableaux de tarifs : une par palier, toutes saisons
 * confondues, ex. [1, 3, 5] avec capacité 6 → « Jusqu'à 2 pers. »,
 * « Jusqu'à 4 pers. », « Jusqu'à 6 pers. » (le dernier palier est borné par
 * la capacité de l'appartement). Prix : getTierPrice(saison, minGuests).
 */
export function getRateTableColumns(
  apartment: ApartmentConfig,
): RateTableColumn[] {
  const thresholds = Array.from(
    new Set(
      Object.values(apartment.defaultRates).flatMap((t) =>
        t.map((r) => r.minGuests),
      ),
    ),
  ).sort((a, b) => a - b);
  return thresholds.map((min, i) => {
    const max =
      i < thresholds.length - 1 ? thresholds[i + 1] - 1 : apartment.capacity;
    return { minGuests: min, maxGuests: max, label: `Jusqu'à ${max} pers.` };
  });
}

/** Palier applicable : le plus haut dont minGuests <= nombre total de personnes. */
export function getTierPrice(tiersList: RateTier[], guests: number): number {
  let price = tiersList[0].price;
  for (const tier of tiersList) {
    if (guests >= tier.minGuests) price = tier.price;
  }
  return price;
}
