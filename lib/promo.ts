// Règles d'application des codes promo, partagées par
// app/api/promo/validate/route.ts (vérification côté visiteur) et
// app/api/bookings/route.ts (nouvelle vérification à la réservation).
//
// Deux formats coexistent :
//  - code par période (valid_from / valid_to renseignés) : toutes les nuits
//    du séjour doivent tomber entre valid_from et valid_to inclus ;
//  - ancien format (dates NULL) : les 3 premières lettres du nom encodent un
//    mois, et l'arrivée comme le départ doivent tomber dans ce mois.

export type PromoRule = {
  name: string;
  valid_from?: string | null; // YYYY-MM-DD, première nuit couverte
  valid_to?: string | null; // YYYY-MM-DD, dernière nuit couverte
};

export function parseMonthFromCode(code: string): number | null {
  // Retourne l'index du mois (0-11) ou null si invalide
  if (!code || code.length < 3) return null;
  const prefix = code.slice(0, 3).toUpperCase();
  // Abréviations FR et EN
  const monthMap: Record<string, number> = {
    JAN: 0,
    FEV: 1,
    FEB: 1,
    MAR: 2,
    AVR: 3,
    APR: 3,
    MAI: 4,
    MAY: 4,
    JUN: 5,
    JUI: 6,
    JUL: 6,
    AOU: 7,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };
  return monthMap[prefix] ?? null;
}

function toDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

/** Date YYYY-MM-DD valide (pas de 31.02 ni de format libre). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return formatIso(toDateOnly(value)) === value;
}

function formatIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function hasValidityPeriod(promo: PromoRule): boolean {
  return Boolean(promo.valid_from && promo.valid_to);
}

/**
 * True si le code s'applique au séjour (dates YYYY-MM-DD). C'est la règle
 * complète : ne jamais appliquer la réduction si elle renvoie false.
 */
export function isPromoApplicable(
  promo: PromoRule,
  arrivalDate: string,
  departureDate: string,
): boolean {
  const start = toDateOnly(arrivalDate);
  const end = toDateOnly(departureDate);
  if (!(start < end)) return false;

  if (hasValidityPeriod(promo)) {
    // Dernière nuit = veille du départ
    const lastNight = new Date(end);
    lastNight.setDate(lastNight.getDate() - 1);
    return (
      start >= toDateOnly(promo.valid_from as string) &&
      lastNight <= toDateOnly(promo.valid_to as string)
    );
  }

  const targetMonthIdx = parseMonthFromCode(promo.name);
  if (targetMonthIdx === null) return false;
  return start.getMonth() === targetMonthIdx && end.getMonth() === targetMonthIdx;
}
