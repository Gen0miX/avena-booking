import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("arrival_date, departure_date")
    .neq("status", 4);

  if (error) {
    return NextResponse.json(
      { message: "Erreur lors de la récupération des dates", details: error },
      { status: 500 }
    );
  }

  // Maps pour traquer les utilisations de chaque date
  const stayDates = new Set<string>(); // Dates de séjour (entre arrivée et départ)
  const arrivalDates = new Set<string>(); // Dates d'arrivée
  const departureDates = new Set<string>(); // Dates de départ

  data?.forEach((booking) => {
    // Traiter directement les chaînes de date pour éviter les problèmes de fuseau horaire
    const startKey = booking.arrival_date; // Format déjà YYYY-MM-DD
    const endKey = booking.departure_date; // Format déjà YYYY-MM-DD

    // Créer des objets Date pour les calculs, en forçant l'heure locale
    const start = new Date(startKey + "T00:00:00");
    const end = new Date(endKey + "T00:00:00");

    // Enregistrer les dates d'arrivée et de départ
    arrivalDates.add(startKey);
    departureDates.add(endKey);

    // Marquer les jours de séjour (exclu start et end)
    const current = new Date(start);
    current.setDate(current.getDate() + 1); // Commencer le jour après l'arrivée

    while (current < end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      const dayKey = `${year}-${month}-${day}`;

      stayDates.add(dayKey);
      current.setDate(current.getDate() + 1);
    }
  });

  // Construire la liste des dates occupées
  const occupiedDates = new Set<string>();

  // 1. Toutes les dates de séjour sont occupées
  stayDates.forEach((date) => occupiedDates.add(date));

  // 2. Les dates qui sont à la fois arrivée ET départ sont occupées (conflit)
  arrivalDates.forEach((date) => {
    if (departureDates.has(date)) {
      occupiedDates.add(date);
    }
  });

  // Debug logs
  console.log("Données de réservation:", data);
  console.log("Dates de séjour:", Array.from(stayDates));
  console.log("Dates d'arrivée:", Array.from(arrivalDates));
  console.log("Dates de départ:", Array.from(departureDates));
  console.log("Dates occupées finales:", Array.from(occupiedDates));

  return NextResponse.json({
    occupiedDates: Array.from(occupiedDates).sort(),
    debug: {
      stayDates: Array.from(stayDates),
      arrivalDates: Array.from(arrivalDates),
      departureDates: Array.from(departureDates),
    },
  });
}
