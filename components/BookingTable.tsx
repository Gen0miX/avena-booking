"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr, th } from "date-fns/locale";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function BookingTable() {
  const { bookings, isLoading, isError, refresh, confirmBooking } =
    useBookings();
  const [confirmingIds, setConfirmingIds] = useState<Set<number>>(new Set());
  const [modalBookingId, setModalBookingId] = useState<number | null>(null);

  const handleConfirmBooking = async (bookingId: number) => {
    // Ajouter l'ID à la liste des réservations en cours de confirmation
    setConfirmingIds((prev) => new Set(prev).add(bookingId));

    try {
      const success = await confirmBooking(bookingId);

      if (success) {
        // Afficher un message de succès (optionnel)
        console.log("Réservation confirmée avec succès");
        // Vous pouvez ajouter ici une notification toast si vous en avez
      } else {
        // Afficher un message d'erreur (optionnel)
        console.error("Erreur lors de la confirmation");
        // Vous pouvez ajouter ici une notification d'erreur
      }
    } finally {
      // Retirer l'ID de la liste des confirmations en cours
      setConfirmingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
      setModalBookingId(null);
    }
  };

  if (isLoading) {
    return <div className="loading loading-dots loading-lg text-primary"></div>;
  }

  if (isError) {
    return <p>Erreur lors du chargement des réservations...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Dates</th>
            <th>Personnes</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking: Booking) => (
            <tr key={booking.id}>
              <td>
                {booking.fname} {booking.lname}
              </td>
              <td>
                {format(booking.arrival_date, "dd MMM yyyy", { locale: fr })} ➡️{" "}
                {format(booking.departure_date, "dd MMM yyyy", { locale: fr })}
              </td>
              <td>
                {booking.no_adults}A /{booking.no_childs ?? 0}E
              </td>
              <td>
                {confirmingIds.has(booking.id) ? (
                  <StatusBadge status={booking.status.name} loading={true} />
                ) : (
                  <StatusBadge status={booking.status.name} />
                )}
              </td>
              <td className="flex gap-2">
                <button
                  className="btn btn-sm btn-circle btn-outline btn-success"
                  onClick={() => setModalBookingId(booking.id)}
                >
                  <FaCheck></FaCheck>
                </button>
                <button className="btn btn-sm btn-circle btn-outline btn-error">
                  <FaTimes></FaTimes>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmation */}
      {modalBookingId && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmer la réservation</h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir confirmer cette réservation ?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-success"
                onClick={() => handleConfirmBooking(modalBookingId!)}
              >
                Confirmer
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setModalBookingId(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
