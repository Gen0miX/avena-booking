"use client";

import { useEffect, useState } from "react";
import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaEdit,
} from "react-icons/fa";

interface BookingDetailsProps {
  bookingId: number;
  onBack: () => void;
}

export default function BookingDetails({
  bookingId,
  onBack,
}: BookingDetailsProps) {
  const { bookings, isLoading, updateBookingStatus } = useBookings();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const foundBooking = bookings.find((b: Booking) => b.id === bookingId);
    setBooking(foundBooking || null);
  }, [bookingId, bookings]);

  const handleAction = async (
    action: "confirm" | "terminate" | "cancel" | "payment"
  ) => {
    if (!booking) return;

    setIsUpdating(true);
    try {
      const success = await updateBookingStatus(booking.id, action);
      if (success) {
        console.log("Réservation mise à jour :", action);
        // Le booking sera mis à jour automatiquement via le hook useBookings
      } else {
        console.error("Erreur lors de la mise à jour");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-dots loading-lg text-primary"></div>
      </div>
    );
  }

  const status = booking.status.id;
  const showConfirmBtn = status === 1 || status === 2;
  const showCancelBtn = status === 1 || status === 2;
  const showPaymentBtn = !booking.is_paid && status === 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête avec actions */}
      <div className="card bg-base-200 border border-primary/40 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FaUser />
                {booking.fname} {booking.lname}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge
                  status={booking.status.name}
                  loading={isUpdating}
                />
                {booking.is_paid ? (
                  <span className="badge badge-success">Payée</span>
                ) : (
                  <span className="badge badge-warning">Non payée</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {booking.price} CHF
              </div>
              <div className="text-sm text-base-content/70">Prix total</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className="btn btn-success"
              onClick={() =>
                handleAction(status === 1 ? "confirm" : "terminate")
              }
              disabled={!showConfirmBtn || isUpdating}
            >
              <FaCheck className="w-4 h-4" />
              {status === 1 ? "Confirmer" : "Terminer"}
            </button>

            <button
              className="btn btn-error"
              onClick={() => handleAction("cancel")}
              disabled={!showCancelBtn || isUpdating}
            >
              <FaTimes className="w-4 h-4" />
              Annuler
            </button>

            <button
              className="btn btn-warning"
              onClick={() => handleAction("payment")}
              disabled={!showPaymentBtn || isUpdating}
            >
              <FaDollarSign className="w-4 h-4" />
              Marquer comme payée
            </button>
          </div>
        </div>
      </div>

      {/* Informations de séjour */}
      <div className="grid md:grid-cols-2 gap-6 ">
        <div className="card shadow-lg bg-base-200 border border-primary/40">
          <div className="card-body">
            <h2 className="card-title">
              <FaCalendarAlt />
              Informations de séjour
            </h2>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-sm">Arrivée</label>
                <div className="text-lg">
                  {format(booking.arrival_date, "EEEE dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
              <div>
                <label className="font-semibold text-sm">Départ</label>
                <div className="text-lg">
                  {format(booking.departure_date, "EEEE dd MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>
              <div>
                <label className="font-semibold text-sm">Durée</label>
                <div className="text-lg">
                  {Math.ceil(
                    (new Date(booking.departure_date).getTime() -
                      new Date(booking.arrival_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  nuits
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border border-primary/40 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              <FaUsers />
              Personnes
            </h2>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-sm">Adultes</label>
                <div className="text-lg">{booking.no_adults}</div>
              </div>
              {(booking.no_childs ?? 0) > 0 && (
                <div>
                  <label className="font-semibold text-sm">Enfants</label>
                  <div className="text-lg">{booking.no_childs}</div>
                </div>
              )}
              <div>
                <label className="font-semibold text-sm">Total</label>
                <div className="text-lg font-semibold">
                  {booking.no_adults + (booking.no_childs ?? 0)} personnes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="card bg-base-200 border border-primary/40 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">
            <FaEnvelope />
            Informations de contact
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-sm">Email</label>
              <div className="text-lg">{booking.mail || "Non renseigné"}</div>
            </div>
            <div>
              <label className="font-semibold text-sm">Téléphone</label>
              <div className="text-lg">{booking.phone || "Non renseigné"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div className="card bg-base-200 border border-primary/40 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Informations système</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-semibold">ID de réservation</label>
              <div>{booking.id}</div>
            </div>
            <div>
              <label className="font-semibold">Date de création</label>
              <div>
                {booking.created_at
                  ? format(new Date(booking.created_at), "dd/MM/yyyy à HH:mm", {
                      locale: fr,
                    })
                  : "Non disponible"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
