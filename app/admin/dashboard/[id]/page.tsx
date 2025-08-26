"use client";

import { useParams } from "next/navigation";
import useBooking from "@/hooks/useBooking";
import StatusBadge from "@/components/StatusBadge";
import { FaLongArrowAltRight } from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function BookingDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { booking, loading, error } = useBooking(id);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;
  if (!booking) return <p>Aucune réservation trouvée.</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Détails réservation #{booking.id}</h1>

      <div className="space-y-2">
        <p>
          <span className="font-semibold">Nom :</span> {booking.fname}{" "}
          {booking.lname}
        </p>
        <p>
          <span className="font-semibold">Email :</span> {booking.mail}
        </p>
        <p>
          <span className="font-semibold">Téléphone :</span> {booking.phone}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-semibold">Dates :</span>{" "}
          {format(booking.arrival_date, "dd MMM yyyy", { locale: fr })}
          <FaLongArrowAltRight />
          {format(booking.departure_date, "dd MMM yyyy", {
            locale: fr,
          })}
        </p>
        <p>
          <span className="font-semibold">Personnes :</span> {booking.no_adults}{" "}
          adultes / {booking.no_childs ?? 0} enfants
        </p>
        <p>
          <span className="font-semibold">Ménage :</span>{" "}
          {booking.is_cleaning ? "Oui" : "Non"}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-semibold">Total :</span>{" "}
          {booking.price.toLocaleString("ch-ch", {
            style: "currency",
            currency: "CHF",
          })}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-semibold">Paiement :</span>{" "}
          {booking.is_paid ? "Payé" : "Non payé"}
        </p>
        <p className="flex items-center gap-2">
          <span className="font-semibold">Statut :</span>{" "}
          <StatusBadge status={booking.status.name} />
        </p>
      </div>

      {/* Préparer pour l'édition future */}
      <div className="mt-6">
        <button className="btn btn-primary">Modifier la réservation</button>
      </div>
    </div>
  );
}
