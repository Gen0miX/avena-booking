import { useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import { ApartmentConfig } from "@/config/apartments";

/**
 * Ramène le nombre de voyageurs à la capacité de l'appartement affiché
 * (ex. 6 personnes choisies pour Avena 2, puis passage à Avena 1 qui en
 * accueille 5) et prévient le visiteur. Les enfants sont retirés en premier.
 */
export function useCapacityGuard(apartment: ApartmentConfig | undefined) {
  const { travelers, adjustTravelers } = useBooking();

  useEffect(() => {
    if (!apartment) return;
    const { capacity, name } = apartment;
    if (travelers.adults + travelers.children <= capacity) return;

    const adults = Math.min(travelers.adults, capacity);
    const children = Math.max(0, Math.min(travelers.children, capacity - adults));
    adjustTravelers(
      { adults, children },
      `${name} accueille ${capacity} personnes au maximum (enfants compris) : le nombre de voyageurs a été ramené à ${capacity}.`,
    );
  }, [apartment, travelers, adjustTravelers]);
}
