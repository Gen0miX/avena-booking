"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FaCheck,
  FaTimes,
  FaDollarSign,
  FaEye,
  FaEllipsisV,
} from "react-icons/fa";

type ModalAction = {
  type: "confirm" | "terminate" | "cancel" | "payment";
  bookingId: number;
};

interface BookingTableProps {
  onBookingSelect: (bookingId: number) => void;
}

export default function BookingTable({ onBookingSelect }: BookingTableProps) {
  const { bookings, isLoading, isError, refresh, updateBookingStatus } =
    useBookings();
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  const handleAction = async (
    bookingId: number,
    action: ModalAction["type"]
  ) => {
    setProcessingIds((prev) => new Set(prev).add(bookingId));

    try {
      const success = await updateBookingStatus(bookingId, action);

      if (success) {
        console.log("Réservation mise à jour :", action);
      } else {
        console.error("Erreur lors de la confirmation");
      }
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
      setModalAction(null);
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const status = booking.status.id;
    const showConfirmBtn = status === 1 || status === 2;
    const showCancelBtn = status === 1 || status === 2;
    const paid = booking.is_paid;
    const showPaymentBtn = !paid && status === 2;

    return (
      <div className="card bg-base-100 shadow-md border border-primary/20 hover:shadow-lg transition-shadow">
        <div className="card-body p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="card-title text-lg">
                {booking.fname} {booking.lname}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {processingIds.has(booking.id) ? (
                  <StatusBadge status={booking.status.name} loading={true} />
                ) : (
                  <StatusBadge status={booking.status.name} />
                )}
                {booking.is_paid ? (
                  <span className="badge badge-success badge-sm">Payée</span>
                ) : (
                  <span className="badge badge-warning badge-sm">
                    Non payée
                  </span>
                )}
              </div>
            </div>
            <span className="font-bold text-primary">{booking.price} CHF</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Arrivée:</span>
              <br />
              <span className="text-base-content/70">
                {format(booking.arrival_date, "dd MMM yyyy", { locale: fr })}
              </span>
            </div>
            <div>
              <span className="font-medium">Départ:</span>
              <br />
              <span className="text-base-content/70">
                {format(booking.departure_date, "dd MMM yyyy", { locale: fr })}
              </span>
            </div>
            <div>
              <span className="font-medium">Adultes:</span>
              <br />
              <span className="text-base-content/70">{booking.no_adults}</span>
            </div>
            {(booking.no_childs ?? 0) > 0 && (
              <div>
                <span className="font-medium">Enfants:</span>
                <br />
                <span className="text-base-content/70">
                  {booking.no_childs ?? 0}
                </span>
              </div>
            )}
          </div>

          <div className="card-actions justify-between mt-4">
            <button
              className="btn btn-sm btn-primary btn-outline"
              onClick={() => onBookingSelect(booking.id)}
            >
              <FaEye className="w-3 h-3" />
              Voir
            </button>

            <div className="flex gap-1">
              <button
                className="btn btn-sm btn-circle btn-outline btn-success"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalAction({
                    type: status === 1 ? "confirm" : "terminate",
                    bookingId: booking.id,
                  });
                }}
                disabled={!showConfirmBtn}
              >
                <FaCheck className="w-3 h-3" />
              </button>

              <button
                className="btn btn-sm btn-circle btn-outline btn-error"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalAction({
                    type: "cancel",
                    bookingId: booking.id,
                  });
                }}
                disabled={!showCancelBtn}
              >
                <FaTimes className="w-3 h-3" />
              </button>

              <button
                className={`btn btn-sm btn-circle ${booking.is_paid ? "btn-success" : "btn-warning btn-outline"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setModalAction({
                    type: "payment",
                    bookingId: booking.id,
                  });
                }}
                disabled={!showPaymentBtn}
              >
                <FaDollarSign className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading loading-dots loading-lg text-primary"></div>;
  }

  if (isError) {
    return <p>Erreur lors du chargement des réservations...</p>;
  }

  return (
    <>
      {/* Vue tableau pour desktop */}
      <div className="hidden lg:block h-full">
        <div className="flex-1 overflow-auto shadow-lg rounded-box border border-primary/40">
          <table className="table table-zebra table-pin-rows w-full">
            <thead>
              <tr>
                <th className="min-w-[120px]">Nom</th>
                <th className="min-w-[140px]">Dates</th>
                <th className="min-w-[100px]">Personnes</th>
                <th className="min-w-[80px]">Statut</th>
                <th className="min-w-[130px]">Actions</th>
                <th className="min-w-[70px]">Payée</th>
                <th className="min-w-[80px]">Prix</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking: Booking) => {
                const status = booking.status.id;
                const showConfirmBtn = status === 1 || status === 2;
                const showCancelBtn = status === 1 || status === 2;
                const paid = booking.is_paid;
                const showPaymentBtn = !paid && status === 2;

                return (
                  <tr
                    key={booking.id}
                    className="h-18 hover:bg-accent/60 hover:text-accent-content cursor-pointer"
                    onClick={() => onBookingSelect(booking.id)}
                  >
                    <td className="font-medium">
                      {booking.fname} {booking.lname}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">
                          {format(booking.arrival_date, "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                        <span className="text-sm opacity-70">
                          {format(booking.departure_date, "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">
                          {booking.no_adults} Adulte(s)
                        </span>
                        {(booking.no_childs ?? 0) > 0 && (
                          <span className="text-sm opacity-70">
                            {booking.no_childs ?? 0} Enfant(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {processingIds.has(booking.id) ? (
                        <StatusBadge
                          status={booking.status.name}
                          loading={true}
                        />
                      ) : (
                        <StatusBadge status={booking.status.name} />
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-sm btn-circle btn-outline btn-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalAction({
                              type: status === 1 ? "confirm" : "terminate",
                              bookingId: booking.id,
                            });
                          }}
                          disabled={!showConfirmBtn}
                        >
                          <FaCheck className="w-3 h-3" />
                        </button>

                        <button
                          className="btn btn-sm btn-circle btn-outline btn-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalAction({
                              type: "cancel",
                              bookingId: booking.id,
                            });
                          }}
                          disabled={!showCancelBtn}
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>

                        <button
                          className={`btn btn-sm btn-circle ${booking.is_paid ? "btn-success" : "btn-warning btn-outline"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalAction({
                              type: "payment",
                              bookingId: booking.id,
                            });
                          }}
                          disabled={!showPaymentBtn}
                        >
                          <FaDollarSign className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td>
                      {booking.is_paid ? (
                        <span className="badge badge-success badge-sm">
                          Oui
                        </span>
                      ) : (
                        <span className="badge badge-warning badge-sm">
                          Non
                        </span>
                      )}
                    </td>
                    <td className="font-medium">{booking.price} CHF</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue cartes pour tablet et mobile */}
      <div className="lg:hidden h-full overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2 grid-cols-1 p-1">
          {bookings.map((booking: Booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </div>

      {/* Modal de confirmation */}
      {modalAction && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {modalAction.type === "confirm" && "Confirmer la réservation"}
              {modalAction.type === "terminate" && "Terminer la réservation"}
              {modalAction.type === "cancel" && "Annuler la réservation"}
              {modalAction.type === "payment" && "Marquer comme payée"}
            </h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir{" "}
              {modalAction.type === "confirm" && "confirmer"}
              {modalAction.type === "terminate" && "terminer"}
              {modalAction.type === "cancel" && "annuler"}
              {modalAction.type === "payment" && "marquer comme payée"} cette
              réservation ?
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
    </>
  );
}
