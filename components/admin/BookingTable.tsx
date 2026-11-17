"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useBookings,
  SortField,
  SortOrder,
  BookingFilters,
} from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/admin/StatusBadge";
import { addDays, differenceInDays, format, isWithinInterval, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  APARTMENT_LIST,
  ApartmentSlug,
  getApartmentBySlug,
} from "@/config/apartments";
import {
  calculateAggregateOccupancyRate,
  calculateOccupancyRate,
} from "@/lib/statistics";
import { IoSearchOutline } from "react-icons/io5";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

type ModalAction = {
  type: "confirm" | "terminate" | "cancel" | "payment";
  bookingId: number;
};

interface BookingTableProps {
  onBookingSelect: (bookingId: number) => void;
  statusGroup?: "current" | "terminated";
  apartment: ApartmentSlug | "all";
  initialFilters?: Partial<BookingFilters>;
  onFiltersChange?: (filters: BookingFilters) => void;
}

const card = "bg-surface rounded-2xl";
const chf = (n: number) => `CHF ${n.toLocaleString("fr-CH")}`;
const initials = (b: Booking) =>
  `${b.fname?.[0] ?? ""}${b.lname?.[0] ?? ""}`.toUpperCase();
const nights = (b: Booking) =>
  differenceInDays(new Date(b.departure_date), new Date(b.arrival_date));
const stayRange = (b: Booking) =>
  `${format(new Date(b.arrival_date), "d MMM", { locale: fr })} – ${format(
    new Date(b.departure_date),
    "d MMM yyyy",
    { locale: fr },
  )}`;
const guests = (b: Booking) => {
  const kids = b.no_childs ?? 0;
  return `${b.no_adults} adulte${b.no_adults > 1 ? "s" : ""}${
    kids > 0 ? `, ${kids} enfant${kids > 1 ? "s" : ""}` : ""
  }`;
};

const MODAL_COPY: Record<ModalAction["type"], { title: string; verb: string }> = {
  confirm: { title: "Confirmer la réservation", verb: "confirmer" },
  terminate: { title: "Terminer la réservation", verb: "terminer" },
  cancel: { title: "Annuler la réservation", verb: "annuler" },
  payment: { title: "Marquer comme payée", verb: "marquer comme payée" },
};

export default function BookingTable({
  onBookingSelect,
  statusGroup = "current",
  apartment,
  initialFilters,
  onFiltersChange,
}: BookingTableProps) {
  const {
    bookings,
    allBookings,
    isLoading,
    isError,
    updateBookingStatus,
    filters,
    updateFilters,
  } = useBookings(apartment, initialFilters, statusGroup);
  const showApartmentColumn = apartment === "all";
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (onFiltersChange) onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const groupStatuses = statusGroup === "terminated" ? [3, 4] : [1, 2];
  const groupBookings = (allBookings as Booking[]).filter((b) =>
    groupStatuses.includes(b.status.id),
  );
  const query = search.trim().toLowerCase();
  const groupedBookings = bookings.filter(
    (b: Booking) =>
      groupStatuses.includes(b.status.id) &&
      (!query ||
        `${b.fname} ${b.lname} ${b.mail ?? ""}`.toLowerCase().includes(query)),
  );

  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  const handleAction = async (
    bookingId: number,
    action: ModalAction["type"],
  ) => {
    setProcessingIds((prev) => new Set(prev).add(bookingId));
    try {
      const success = await updateBookingStatus(bookingId, action);
      if (!success) console.error("Erreur lors de la mise à jour");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
      setModalAction(null);
    }
  };

  const handleSort = (field: SortField) => {
    const newOrder: SortOrder =
      filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";
    updateFilters({ sortBy: field, sortOrder: newOrder });
  };

  const getSortIcon = (field: SortField) => {
    if (filters.sortBy !== field) return <FaSort className="opacity-40" />;
    return filters.sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Synthèse "à traiter" (réservations en cours uniquement)
  const summary = useMemo(() => {
    const all = allBookings as Booking[];
    const today = startOfDay(new Date());
    const in7 = addDays(today, 7);
    const pending = all.filter((b) => b.status.id === 1);
    const arrivals = all.filter(
      (b) =>
        (b.status.id === 1 || b.status.id === 2) &&
        isWithinInterval(new Date(b.arrival_date), { start: today, end: in7 }),
    );
    const tomorrow = addDays(today, 1).toDateString();
    const arrivalsTomorrow = arrivals.filter(
      (b) => new Date(b.arrival_date).toDateString() === tomorrow,
    ).length;
    const unpaid = all.filter((b) => b.status.id === 2 && !b.is_paid);
    const occupancy =
      apartment === "all"
        ? calculateAggregateOccupancyRate(
            all,
            APARTMENT_LIST.map((a) => a.slug),
            "month",
          )
        : calculateOccupancyRate(all, "month");
    return {
      pending: pending.length,
      arrivals: arrivals.length,
      arrivalsTomorrow,
      unpaidCount: unpaid.length,
      unpaidTotal: unpaid.reduce((s, b) => s + b.price, 0),
      occupancy: Math.round(occupancy),
    };
  }, [allBookings, apartment]);

  const tabs =
    statusGroup === "terminated"
      ? [
          { value: "all" as const, label: "Toutes" },
          { value: 3, label: "Terminées" },
          { value: 4, label: "Annulées" },
        ]
      : [
          { value: "all" as const, label: "Toutes" },
          { value: 1, label: "En attente" },
          { value: 2, label: "Confirmées" },
        ];
  const countFor = (value: "all" | number) =>
    value === "all"
      ? groupBookings.length
      : groupBookings.filter((b) => b.status.id === value).length;

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-dots loading-lg text-cta" />
      </div>
    );
  }
  if (isError) {
    return (
      <div role="alert" className="alert alert-error">
        Erreur lors du chargement des réservations.
      </div>
    );
  }

  const ActionButtons = ({
    booking,
    full = false,
  }: {
    booking: Booking;
    full?: boolean;
  }) => {
    const status = booking.status.id;
    const busy = processingIds.has(booking.id);
    const open = (type: ModalAction["type"]) => (e: React.MouseEvent) => {
      e.stopPropagation();
      setModalAction({ type, bookingId: booking.id });
    };
    const size = full ? "h-11 flex-1" : "btn-sm h-9";
    return (
      <div className={`flex gap-1.5 ${full ? "" : "justify-end"}`}>
        {status === 1 && (
          <>
            {full && (
              <button
                type="button"
                disabled={busy}
                onClick={open("cancel")}
                className={`btn ${size} rounded-lg btn-outline btn-error`}
              >
                Refuser
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={open("confirm")}
              className={`btn ${size} rounded-lg border-0 bg-cta text-cta-content hover:bg-cta/90`}
            >
              Confirmer
            </button>
          </>
        )}
        {status === 2 && !booking.is_paid && (
          <button
            type="button"
            disabled={busy}
            onClick={open("payment")}
            className={`btn ${size} rounded-lg btn-outline border-base-300`}
          >
            Marquer payée
          </button>
        )}
        {status === 2 && booking.is_paid && !full && (
          <button
            type="button"
            disabled={busy}
            onClick={open("terminate")}
            className={`btn ${size} rounded-lg btn-outline border-base-300`}
          >
            Terminer
          </button>
        )}
        {!full && (status === 1 || status === 2) && (
          <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              tabIndex={0}
              aria-label="Plus d'actions"
              className="btn btn-sm h-9 w-9 p-0 rounded-lg btn-outline border-base-300"
            >
              <span aria-hidden="true" className="text-lg leading-none">⋯</span>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-surface rounded-box shadow-lg z-20 w-52 p-2"
            >
              <li>
                <button type="button" onClick={() => onBookingSelect(booking.id)}>
                  Voir le détail
                </button>
              </li>
              {status === 2 && (
                <li>
                  <button type="button" onClick={open("terminate")}>
                    Terminer
                  </button>
                </li>
              )}
              <li>
                <button type="button" className="text-error" onClick={open("cancel")}>
                  Annuler la réservation
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {statusGroup === "current" && (
        <section
          aria-label="À traiter"
          className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className={`${card} p-4 sm:p-5 border border-warning/40`}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-base-content/85">
              <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
              À confirmer
            </p>
            <p className="font-heading text-[28px] sm:text-[34px] font-semibold">
              {summary.pending}
            </p>
            <p className="hidden sm:block text-[13px] text-base-content/65">
              demande{summary.pending > 1 ? "s" : ""} en attente de réponse
            </p>
          </div>
          <div className={`${card} p-4 sm:p-5`}>
            <p className="text-[13px] font-semibold text-base-content/75">
              Paiements attendus
            </p>
            <p className="font-heading text-[28px] sm:text-[34px] font-semibold">
              {chf(summary.unpaidTotal)}
            </p>
            <p className="hidden sm:block text-[13px] text-base-content/65">
              {summary.unpaidCount} réservation{summary.unpaidCount > 1 ? "s" : ""}{" "}
              confirmée{summary.unpaidCount > 1 ? "s" : ""} non payée
              {summary.unpaidCount > 1 ? "s" : ""}
            </p>
          </div>
          <div className={`${card} p-5 hidden xl:block`}>
            <p className="text-[13px] font-semibold text-base-content/75">
              Arrivées · 7 prochains jours
            </p>
            <p className="font-heading text-[34px] font-semibold">
              {summary.arrivals}
            </p>
            <p className="text-[13px] text-base-content/65">
              {summary.arrivalsTomorrow > 0
                ? `dont ${summary.arrivalsTomorrow} demain`
                : "aucune demain"}
            </p>
          </div>
          <div className={`${card} p-5 hidden xl:block`}>
            <p className="text-[13px] font-semibold text-base-content/75">
              Occupation · {format(new Date(), "MMMM", { locale: fr })}
            </p>
            <p className="font-heading text-[34px] font-semibold">
              {summary.occupancy} %
            </p>
            <div aria-hidden="true" className="h-1.5 rounded-full bg-base-200 overflow-hidden mt-1">
              <div className="h-full bg-cta" style={{ width: `${summary.occupancy}%` }} />
            </div>
          </div>
        </section>
      )}

      <section className={`${card} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-base-200">
          <div role="tablist" aria-label="Filtrer par statut" className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const selected = filters.status === tab.value;
              return (
                <button
                  key={String(tab.value)}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => updateFilters({ status: tab.value })}
                  className={`px-3.5 py-2 rounded-full text-sm transition-colors ${
                    selected
                      ? "bg-base-content text-base-100 font-semibold"
                      : "text-base-content/75 hover:bg-base-200"
                  }`}
                >
                  {tab.label} · {countFor(tab.value)}
                </button>
              );
            })}
          </div>
          <label className="input h-10 rounded-xl w-full sm:w-64">
            <IoSearchOutline className="text-base-content/60" aria-hidden="true" />
            <span className="sr-only">Rechercher un client</span>
            <input
              type="search"
              placeholder="Rechercher un client"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {groupedBookings.length === 0 ? (
          <p className="px-5 py-12 text-center text-base-content/65">
            Aucune réservation à afficher.
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.06em] text-base-content/65">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center gap-1.5 uppercase">
                        Client {getSortIcon("name")}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      <button type="button" onClick={() => handleSort("dates")} className="inline-flex items-center gap-1.5 uppercase">
                        Séjour {getSortIcon("dates")}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">Voyageurs</th>
                    {showApartmentColumn && (
                      <th scope="col" className="px-3 py-3 font-semibold">Appartement</th>
                    )}
                    <th scope="col" className="px-3 py-3 font-semibold">
                      <button type="button" onClick={() => handleSort("status")} className="inline-flex items-center gap-1.5 uppercase">
                        Statut {getSortIcon("status")}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">Paiement</th>
                    <th scope="col" className="px-3 py-3 font-semibold text-right">
                      <button type="button" onClick={() => handleSort("price")} className="inline-flex items-center gap-1.5 uppercase">
                        Montant {getSortIcon("price")}
                      </button>
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedBookings.map((booking: Booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => onBookingSelect(booking.id)}
                      className="border-t border-base-200 hover:bg-base-100 cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className="size-9 rounded-full bg-cta/15 text-cta font-semibold text-[13px] flex items-center justify-center shrink-0">
                            {initials(booking)}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookingSelect(booking.id);
                              }}
                              className="font-semibold text-left hover:underline"
                            >
                              {booking.fname} {booking.lname}
                            </button>
                            <span className="text-[13px] text-base-content/65 truncate">
                              {booking.mail}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium">{stayRange(booking)}</span>
                          <span className="text-[13px] text-base-content/65">
                            {nights(booking)} nuit{nights(booking) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-base-content/80">{guests(booking)}</td>
                      {showApartmentColumn && (
                        <td className="px-3 py-3.5">
                          {getApartmentBySlug(booking.apartment_id)?.name ?? booking.apartment_id}
                        </td>
                      )}
                      <td className="px-3 py-3.5">
                        <StatusBadge status={booking.status.name} loading={processingIds.has(booking.id)} />
                      </td>
                      <td className="px-3 py-3.5">
                        {booking.status.id === 1 || booking.status.id === 4 ? (
                          <span className="text-base-content/40">—</span>
                        ) : (
                          <span
                            className={`badge badge-soft rounded-full font-semibold text-[13px] ${
                              booking.is_paid ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {booking.is_paid ? "Payée" : "Non payée"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right font-semibold tabular-nums">
                        {chf(booking.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionButtons booking={booking} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablette */}
            <div className="lg:hidden grid md:grid-cols-2 gap-3 p-3 bg-base-100">
              {groupedBookings.map((booking: Booking) => (
                <article
                  key={booking.id}
                  className={`${card} p-4 flex flex-col gap-3`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onBookingSelect(booking.id)}
                        className="font-semibold text-base text-left hover:underline"
                      >
                        {booking.fname} {booking.lname}
                      </button>
                      <p className="text-[13px] text-base-content/65">
                        {stayRange(booking)} · {nights(booking)} nuit
                        {nights(booking) > 1 ? "s" : ""} · {guests(booking)}
                      </p>
                      {showApartmentColumn && (
                        <p className="text-[13px] text-base-content/65">
                          {getApartmentBySlug(booking.apartment_id)?.name ?? booking.apartment_id}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums whitespace-nowrap">
                      {chf(booking.price)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={booking.status.name} loading={processingIds.has(booking.id)} />
                    {booking.status.id === 2 && (
                      <span
                        className={`badge badge-soft rounded-full font-semibold text-[13px] ${
                          booking.is_paid ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {booking.is_paid ? "Payée" : "Non payée"}
                      </span>
                    )}
                  </div>
                  {(booking.status.id === 1 ||
                    (booking.status.id === 2 && !booking.is_paid)) && (
                    <ActionButtons booking={booking} full />
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {modalAction && (
        <dialog open className="modal modal-open" aria-labelledby="booking-action-title">
          <div className="modal-box rounded-2xl bg-surface">
            <h3 id="booking-action-title" className="font-heading font-semibold text-2xl">
              {MODAL_COPY[modalAction.type].title}
            </h3>
            <p className="py-4 text-base-content/80">
              Êtes-vous sûr de vouloir {MODAL_COPY[modalAction.type].verb} cette
              réservation ?
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn rounded-xl btn-outline border-base-300"
                onClick={() => setModalAction(null)}
              >
                Non
              </button>
              <button
                type="button"
                className={`btn rounded-xl border-0 ${
                  modalAction.type === "cancel"
                    ? "btn-error"
                    : "bg-cta text-cta-content hover:bg-cta/90"
                }`}
                onClick={() => handleAction(modalAction.bookingId, modalAction.type)}
              >
                Oui, {MODAL_COPY[modalAction.type].verb}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Fermer"
            onClick={() => setModalAction(null)}
          />
        </dialog>
      )}
    </div>
  );
}
