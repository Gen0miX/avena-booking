// Paramètres généraux de l'application
export interface AppSettings {
  id: number;
  booking_blocked_after: string | null; // ISO date string "YYYY-MM-DD" ou null si pas de blocage
  created_at?: string;
  updated_at?: string;
}

export interface AppSettingsInput {
  booking_blocked_after: string | null;
}

// Valeur par défaut pour la date limite de réservation (fin octobre 2028)
export const DEFAULT_BOOKING_BLOCKED_AFTER = "2028-10-31";

/**
 * Vérifie si une date est bloquée pour les réservations (après la date limite)
 * @param date - La date à vérifier
 * @param blockedAfter - La date limite après laquelle les réservations sont bloquées (format YYYY-MM-DD)
 * @returns true si la date est bloquée (après la limite)
 */
export function isDateBlocked(
  date: Date,
  blockedAfter: string | null
): boolean {
  if (!blockedAfter) return false;

  const limitDate = new Date(blockedAfter);
  limitDate.setHours(23, 59, 59, 999); // Fin de journée

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate > limitDate;
}

/**
 * Formate une date pour l'affichage
 */
export function formatBlockedDate(dateString: string | null): string {
  if (!dateString) return "Aucune limite";

  const date = new Date(dateString);
  return date.toLocaleDateString("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
