// Shared promo-code month-window logic. A promo code's first 3 letters
// encode a month, and both the arrival and departure date must fall
// inside that month for the code to be applicable. Used both by
// app/api/promo/validate/route.ts (user-facing validation) and
// app/api/bookings/route.ts (server-side re-check at booking time).

export function parseMonthFromCode(code: string): number | null {
  // Retourne l'index du mois (0-11) ou null si invalide
  if (!code || code.length < 3) return null;
  const prefix = code.slice(0, 3).toUpperCase();
  // Support EN et FR abréviations courantes
  const monthMap: Record<string, number> = {
    JAN: 0,
    FEV: 1, // français
    FEB: 1, // anglais
    MAR: 2,
    AVR: 3, // français
    APR: 3, // anglais
    MAI: 4, // français
    MAY: 4, // anglais
    JUN: 5,
    JUI: 6, // français (juil)
    JUL: 6, // anglais
    AOU: 7, // français (août)
    AUG: 7, // anglais
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
    DECEMBRE: 11, // tolérance si codes différents (non requis)
  };
  // Gestion de cas FR "JUIL", "AOUT" en 3 lettres déjà mappées JUI/AOU
  return monthMap[prefix] ?? null;
}

function toDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

/**
 * True when `code`'s encoded month matches both the arrival and departure
 * date (both YYYY-MM-DD strings). This is the full applicability rule —
 * callers must not apply the promo's discount unless this returns true.
 */
export function isPromoApplicable(
  code: string,
  arrivalDate: string,
  departureDate: string
): boolean {
  const targetMonthIdx = parseMonthFromCode(code);
  if (targetMonthIdx === null) return false;
  const start = toDateOnly(arrivalDate);
  const end = toDateOnly(departureDate);
  return (
    start.getMonth() === targetMonthIdx && end.getMonth() === targetMonthIdx
  );
}
