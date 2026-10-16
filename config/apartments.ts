import { SeasonKey } from "@/lib/pricingPeriods";

export interface RateTier {
  minAdults: number;
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
  capacity: number; // max total travelers (adults + children) AND max adults for pricing tiers
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
  return entries.map(([minAdults, price]) => ({ minAdults, price }));
}

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
  defaultRates: {
    basseSaison: tiers([[1, 150], [3, 200], [5, 250]]),
    novembre: tiers([[1, 250], [5, 250]]),
    hiver: tiers([[1, 280], [5, 300]]),
    fetes: tiers([[1, 350], [5, 400]]),
  },
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
    capacityIntro: "Cet appartement lumineux peut accueillir jusqu'à 5 personnes et dispose de :",
    features: [
      "Deux chambres spacieuses avec literie de qualité (possibilité d'ajouter un matelas et un duvet pour une 5ᵉ personne)",
      "Un salon chaleureux avec coin repas",
      "Une cuisine équipée (four, plaques, lave-vaisselle, machine à café)",
      "Une salle de bain",
      "Wi-Fi gratuit, écran, linge de lit et serviettes inclus",
    ],
    locationIntro: "Située à 1800 mètres d'altitude, Saas-Fee est une destination de choix pour un séjour en montagne en toute saison.",
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
  bedrooms: null, // TODO(client)
  bathrooms: null, // TODO(client)
  petsAllowed: false, // TODO(client): confirmer
  defaultRates: {
    // Paliers 1/3/5 repris à l'identique d'Avena 1 (décision client). Le
    // palier 6 personnes est un placeholder aligné sur le palier 5 en
    // attendant un tarif définitif — TODO(client) avant mise en prod.
    basseSaison: tiers([[1, 150], [3, 200], [5, 250], [6, 250]]),
    novembre: tiers([[1, 250], [5, 250], [6, 250]]),
    hiver: tiers([[1, 280], [5, 300], [6, 300]]),
    fetes: tiers([[1, 350], [5, 400], [6, 400]]),
  },
  gallery: [], // TODO(client): photos à ajouter
  amenities: [], // TODO(client): équipements à lister
  description: {
    tagline: "TODO(client): accroche",
    intro: "TODO(client): description à rédiger",
    capacityIntro: "TODO(client)",
    features: [],
    locationIntro: "TODO(client)",
    winterHighlights: [],
    summerHighlights: [],
    locationOutro: "TODO(client)",
  },
  isContentComplete: false,
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

/** Tier lookup helper shared by priceCalculator: picks the highest tier whose minAdults <= adults. */
export function getTierPrice(tiersList: RateTier[], adults: number): number {
  let price = tiersList[0].price;
  for (const tier of tiersList) {
    if (adults >= tier.minAdults) price = tier.price;
  }
  return price;
}
