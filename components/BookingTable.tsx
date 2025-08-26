"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr, th } from "date-fns/locale";
import { FaCheck, FaTimes, FaDollarSign } from "react-icons/fa";

type ModalAction = {
  type: "confirm" | "terminate" | "cancel";
  bookingId: number;
};

export default function BookingTable() {
  const router = useRouter();
  const { bookings, isLoading, isError, refresh, updateBookingStatus } =
    useBookings();
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  const handleAction = async (
    bookingId: number,
    action: ModalAction["type"]
  ) => {
    // Ajouter l'ID à la liste des réservations en cours de confirmation
    setProcessingIds((prev) => new Set(prev).add(bookingId));

    try {
      const success = await updateBookingStatus(bookingId, action);

      if (success) {
        // Afficher un message de succès (optionnel)
        console.log("Réservation mise à jour :", action);
        // Vous pouvez ajouter ici une notification toast si vous en avez
      } else {
        // Afficher un message d'erreur (optionnel)
        console.error("Erreur lors de la confirmation");
        // Vous pouvez ajouter ici une notification d'erreur
      }
    } finally {
      // Retirer l'ID de la liste des confirmations en cours
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
      setModalAction(null);
    }
  };

  if (isLoading) {
    return <div className="loading loading-dots loading-lg text-primary"></div>;
  }

  if (isError) {
    return <p>Erreur lors du chargement des réservations...</p>;
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-box border border-primary/40">
      <table className="table table-zebra table-pin-rows w-full">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Dates</th>
            <th>Personnes</th>
            <th>Statut</th>
            <th>Actions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking: Booking) => {
            const status = booking.status.id;
            const showConfirmBtn = status === 1 || status === 2;
            const showCancelBtn = status === 1;

            return (
              <tr
                key={booking.id}
                className="h-18 hover:bg-accent/60 hover:text-accent-content cursor-pointer"
                onClick={() => router.push(`/admin/dashboard/${booking.id}`)}
              >
                <td>
                  {booking.fname} {booking.lname}
                </td>
                <td>
                  {format(booking.arrival_date, "dd MMM yyyy", { locale: fr })}
                  ➡️
                  {format(booking.departure_date, "dd MMM yyyy", {
                    locale: fr,
                  })}
                </td>
                <td>
                  {booking.no_adults}A /{booking.no_childs ?? 0}E
                </td>
                <td>
                  {processingIds.has(booking.id) ? (
                    <StatusBadge status={booking.status.name} loading={true} />
                  ) : (
                    <StatusBadge status={booking.status.name} />
                  )}
                </td>
                <td className="flex gap-2 h-18 items-center">
                  {showConfirmBtn && (
                    <button
                      className="btn btn-sm btn-circle btn-outline btn-success"
                      onClick={() =>
                        setModalAction({
                          type: status === 1 ? "confirm" : "terminate",
                          bookingId: booking.id,
                        })
                      }
                    >
                      <FaCheck />
                    </button>
                  )}
                  {showCancelBtn && (
                    <button
                      className="btn btn-sm btn-circle btn-outline btn-error"
                      onClick={() =>
                        setModalAction({
                          type: "cancel",
                          bookingId: booking.id,
                        })
                      }
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button
                    className={`btn btn-sm btn-circle ${booking.is_paid ? "btn-success" : "btn-warning btn-outline"}`}
                    disabled={booking.is_paid}
                  >
                    <FaDollarSign />
                  </button>
                </td>
                <td className="gap-2 items-center"></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal de confirmation */}
      {modalAction && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {modalAction.type === "confirm" && "Confirmer la réservation"}
              {modalAction.type === "terminate" && "Terminer la réservation"}
              {modalAction.type === "cancel" && "Annuler la réservation"}
            </h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir{" "}
              {modalAction.type === "confirm" && "confirmer"}
              {modalAction.type === "terminate" && "terminer"}
              {modalAction.type === "cancel" && "annuler"} cette réservation ?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-success"
                onClick={() =>
                  handleAction(modalAction.bookingId, modalAction.type)
                }
              >
                Oui
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setModalAction(null)}
              >
                Non
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
