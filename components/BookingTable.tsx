"use client";

import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function BookingTable() {
  const { bookings, isLoading, isError, refresh } = useBookings();

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
                <StatusBadge status={booking.status.name} />
              </td>
              <td>
                <button className="btn btn-sm btn-circle btn-outline btn-success">
                  <FaCheck></FaCheck>
                </button>
              </td>
              <td>
                <button className="btn btn-sm btn-circle btn-outline btn-error">
                  <FaTimes></FaTimes>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
