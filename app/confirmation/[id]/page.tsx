"use client";

import { useParams } from "next/navigation";
import useBooking from "@/hooks/useBooking";
import NavBar from "@/components/NavBar";

export default function ConfirmationPage() {
  const { id } = useParams(); // récupère l'id depuis l'URL
  const bookingId = Number(id);

  const { booking, loading, error } = useBooking(bookingId);

  if (loading) {
    return <p className="text-center mt-20">Chargement de la réservation...</p>;
  }

  if (error || !booking) {
    return (
      <main className="max-w-2xl mx-auto mt-20 p-6 bg-base-200 rounded-box shadow-lg">
        <h1 className="text-2xl font-bold text-error">
          Réservation introuvable
        </h1>
        <p className="mt-4">
          Cette confirmation n'est pas accessible sans une réservation valide.
        </p>
      </main>
    );
  }

  return (
    <>
      <NavBar />
      <main className="max-w-3xl mx-auto mt-28 p-6 bg-base-200 rounded-box border border-primary/40 shadow-md">
        <h1 className="text-3xl font-bold mb-6">
          Confirmation de votre réservation
        </h1>
        <p className="mb-4">
          Merci{" "}
          <span className="font-semibold">
            {booking.fname} {booking.lname}
          </span>{" "}
          !
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            📅 Arrivée :{" "}
            {new Date(booking.arrival_date).toLocaleDateString("fr-CH")}
          </li>
          <li>
            📅 Départ :{" "}
            {new Date(booking.departure_date).toLocaleDateString("fr-CH")}
          </li>
          <li>
            👨‍👩‍👧 Voyageurs : {booking.no_adults} adultes, {booking.no_childs}{" "}
            enfants
          </li>
          <li>🧹 Ménage : {booking.is_cleaning ? "Oui (+100 CHF)" : "Non"}</li>
          <li>
            💰 Prix total :{" "}
            {booking.price.toLocaleString("fr-CH", {
              style: "currency",
              currency: "CHF",
            })}
          </li>
        </ul>
        <p className="mt-6">
          Un e-mail résumant votre réservation vous a également été envoyé.
        </p>
      </main>
    </>
  );
}
