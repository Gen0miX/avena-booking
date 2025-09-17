"use client";

import { useParams } from "next/navigation";
import useBooking from "@/hooks/useBooking";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

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
      <main className="max-w-5xl lg:mx-auto mx-1 mt-28 mb-14 p-6 bg-base-200 rounded-box border border-primary/40 shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Confirmation de votre réservation
        </h1>

        <p className="mb-4 text-center">
          Merci{" "}
          <span className="font-semibold">
            {booking.fname} {booking.lname}
          </span>{" "}
          ! Votre réservation nous est bien parvenue.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                📅 Arrivée :{" "}
                {new Date(booking.arrival_date).toLocaleDateString("fr-CH")}
              </li>
              <li>⏰ Heure de check-in : {booking.checkin_time || "16:00"}</li>
              <li>
                📅 Départ :{" "}
                {new Date(booking.departure_date).toLocaleDateString("fr-CH")}
              </li>
              <li>
                ⏰ Heure de check-out : {booking.checkout_time || "11:00"}
              </li>
              <li>
                👨‍👩‍👧 Voyageurs : {booking.no_adults} adultes, {booking.no_childs}{" "}
                enfants
              </li>
              <li>
                💰 Prix total :{" "}
                {booking.price.toLocaleString("fr-CH", {
                  style: "currency",
                  currency: "CHF",
                })}
              </li>
            </ul>

            <p className="my-6">
              Un e-mail récapitulatif et une QR-Facture vous a également été
              envoyé. <br />
              Pour toute question, contactez-nous :
              <br />
              📧{" "}
              <a
                href="mailto:info@avena39.ch"
                className="underline text-primary"
              >
                info@avena39.ch
              </a>
              <br />
              📞 +41 76 370 86 77
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {booking.status.id === 1 && (
              <div className="mt-1 p-4 bg-warning rounded-md border-2 border-primary/20 text-warning-content">
                <h2 className="font-semibold mb-2">
                  💳 Instructions de paiement
                </h2>
                <p>
                  Votre réservation est actuellement <b>en attente</b> et sera
                  confirmée après réception de votre paiement.
                </p>
                <p className="mt-2">
                  IBAN : <b>CH64 0076 8125 0290 8410 3</b>
                  <br />
                  Titulaire : <b>Réganély Noémie</b>
                  <br />
                  Adresse : <b>Ch. de Beaulieu 1, 1752 Villars-sur-Glâne</b>
                </p>
                <p className="mt-2">
                  Merci d’indiquer comme communication de paiement : <br />
                  <b>
                    Réservation #{bookingId} - {booking.fname} {booking.lname}
                  </b>
                </p>
              </div>
            )}

            <div className="p-4 bg-info rounded-md border-2 border-primary/20 text-info-content">
              <h2 className="font-semibold mb-2">📌 Informations pratiques</h2>
              <p>Arrivée autonome via boîte à clés</p>
              <p className="mt-2">Avant votre départ :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Jeter les ordures (poubelle + déchetterie)</li>
                <li>Retirer les draps des lits utilisés</li>
                <li>Remettre les clés dans la boîte à clés</li>
                <li>Vérifier que toutes les portes soient bien verrouillées</li>
              </ul>
              <p className="mt-2">
                Consultez nos{" "}
                <Link
                  href="/conditions-generales"
                  target="_blank"
                  className="underline"
                >
                  conditions d’annulation
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
