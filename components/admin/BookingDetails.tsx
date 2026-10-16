"use client";

import { useEffect, useState } from "react";
import useBooking from "@/hooks/useBooking";
import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/admin/StatusBadge";
import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import PopoverDatePicker from "@/components/PopoverDatePicker";
import TravelersSelector from "@/components/TravelersSelector";
import { Travelers } from "@/lib/bookings";
import { getPriceResult, getNights, getCategory } from "@/utils/priceCalculator";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
import { getApartmentBySlug } from "@/config/apartments";
import {
  IoArrowBackOutline,
  IoCreateOutline,
  IoMailOutline,
  IoTimeOutline,
} from "react-icons/io5";

interface BookingDetailsProps {
  bookingId: number;
  onBack: () => void;
}

export default function BookingDetails({
  bookingId,
  onBack,
}: BookingDetailsProps) {
  const { booking, loading, updateBooking, refresh } = useBooking(bookingId);
  const { updateBookingStatus } = useBookings();
  const apartment = booking ? getApartmentBySlug(booking.apartment_id) : undefined;
  const { periods } = usePricingPeriods(booking?.apartment_id ?? null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [autoPrice, setAutoPrice] = useState<boolean>(true);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  const [formValues, setFormValues] = useState({
    arrival_date: "",
    departure_date: "",
    no_adults: 1,
    no_childs: 0 as number | null,
    mail: "",
    phone: "",
    address: "",
    postal_code: "",
    city: "",
    birthdate: "",
    price: 0,
    is_paid: false,
    is_cleaning: false,
  });

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    undefined
  );
  const [travelers, setTravelers] = useState<Travelers>({
    adults: 1,
    children: 0,
  });

  const formatDateForInput = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const hydrateForm = (b: Booking) => {
    setFormValues({
      arrival_date: formatDateForInput(b.arrival_date),
      departure_date: formatDateForInput(b.departure_date),
      no_adults: b.no_adults,
      no_childs: b.no_childs ?? 0,
      mail: b.mail ?? "",
      phone: b.phone ?? "",
      address: b.address ?? "",
      postal_code: b.postal_code ?? "",
      city: b.city ?? "",
      birthdate: b.birthdate ? formatDateForInput(b.birthdate) : "",
      price: b.price,
      is_paid: !!b.is_paid,
      is_cleaning: !!b.is_cleaning,
    });
    setSelectedRange({
      from: new Date(b.arrival_date),
      to: new Date(b.departure_date),
    });
    setTravelers({ adults: b.no_adults, children: b.no_childs ?? 0 });
  };

  useEffect(() => {
    if (booking && isEditing) {
      hydrateForm(booking);
    }
  }, [booking, bookingId, isEditing]);

  const handleAction = async (
    action: "confirm" | "terminate" | "cancel" | "payment"
  ) => {
    if (!booking) return;

    setIsUpdating(true);
    try {
      const success = await updateBookingStatus(booking.id, action);
      if (success) {
        console.log("Réservation mise à jour :", action);
        await refresh(); // Rafraîchir via le hook useBooking
      } else {
        console.error("Erreur lors de la mise à jour");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditToggle = () => {
    if (!booking) return;
    if (!isEditing) {
      hydrateForm(booking);
      setErrorMessage(null);
    }
    setIsEditing((prev) => !prev);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormValues((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
    if (name === "no_adults") {
      setTravelers((t) => ({ ...t, adults: Number(value) }));
    }
    if (name === "no_childs") {
      setTravelers((t) => ({ ...t, children: Number(value) }));
    }
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    setFormValues((prev) => ({
      ...prev,
      arrival_date: range?.from ? formatDateForInput(range.from) : "",
      departure_date: range?.to ? formatDateForInput(range.to) : "",
    }));
  };

  // Auto-calcul du prix pendant l'édition
  useEffect(() => {
    if (!isEditing || !apartment) return;
    const start = selectedRange?.from
      ? new Date(selectedRange.from)
      : undefined;
    const end = selectedRange?.to ? new Date(selectedRange.to) : undefined;
    const adults = travelers.adults;

    const { price, error } = getPriceResult({
      start,
      end,
      adults,
      customPeriods: periods,
      apartment,
    });
    setPriceError(error);
    setSuggestedPrice(price);

    if (autoPrice && price !== null) {
      setFormValues((prev) => ({ ...prev, price }));
    }
  }, [isEditing, selectedRange, travelers.adults, autoPrice, periods, apartment]);

  const handleSave = async () => {
    if (!booking) return;
    setIsSaving(true);
    setErrorMessage(null);

    if (!formValues.arrival_date || !formValues.departure_date) {
      setErrorMessage("Les dates d'arrivée et de départ sont requises.");
      setIsSaving(false);
      return;
    }
    if (
      new Date(formValues.departure_date) <= new Date(formValues.arrival_date)
    ) {
      setErrorMessage(
        "La date de départ doit être postérieure à la date d'arrivée."
      );
      setIsSaving(false);
      return;
    }

    try {
      await updateBooking({
        arrival_date: formValues.arrival_date,
        departure_date: formValues.departure_date,
        no_adults: formValues.no_adults,
        no_childs: formValues.no_childs,
        mail: formValues.mail || null,
        phone: formValues.phone || null,
        address: formValues.address || null,
        postal_code: formValues.postal_code || null,
        city: formValues.city || null,
        birthdate: formValues.birthdate || null,
        price: formValues.price,
        is_paid: formValues.is_paid,
        is_cleaning: formValues.is_cleaning,
      });

      setIsEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendEmail = async () => {
    if (!booking) return;
    setIsResending(true);
    setResendError(null);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/resend-email`, {
        method: "POST",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'envoi de l'email");
      }
    } catch (e: unknown) {
      setResendError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setIsResending(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-dots loading-lg text-cta"></div>
      </div>
    );
  }

  const status = booking.status.id;
  const showConfirmBtn = status === 1 || status === 2;
  const showCancelBtn = status === 1 || status === 2;
  const showPaymentBtn = !booking.is_paid && status === 2;

  const stayNights = getNights(
    new Date(booking.arrival_date),
    new Date(booking.departure_date),
  );
  const daysToArrival = differenceInCalendarDays(
    new Date(booking.arrival_date),
    new Date(),
  );
  const chf = (n: number) => `CHF ${n.toLocaleString("fr-CH")}`;
  const notice =
    status === 1
      ? "Demande en attente de votre confirmation."
      : status === 2 && !booking.is_paid
        ? `${
            daysToArrival === 1
              ? "Arrivée demain — "
              : daysToArrival >= 0 && daysToArrival <= 7
                ? `Arrivée dans ${daysToArrival} jours — `
                : ""
          }le paiement de ${chf(booking.price)} n'a pas encore été reçu.`
        : null;

  const card = "bg-surface rounded-2xl p-5 sm:p-6";
  const label = "text-[13px] text-base-content/65 mb-1";
  const input = "input w-full h-11 rounded-xl";
  const btnOutline = "btn h-11 rounded-xl btn-outline border-base-300";

  return (
    <div className="flex flex-col gap-5 pb-12">
      <button
        type="button"
        onClick={onBack}
        className="self-start inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-base-content py-2"
      >
        <IoArrowBackOutline size={16} aria-hidden="true" />
        Réservations
      </button>

      {/* En-tête avec actions */}
      <header className={`${card} flex flex-wrap gap-5 items-center justify-between`}>
        <div className="flex items-center gap-4 min-w-0">
          <span
            aria-hidden="true"
            className="size-14 rounded-full bg-cta/15 text-cta font-semibold text-lg flex items-center justify-center shrink-0"
          >
            {`${booking.fname?.[0] ?? ""}${booking.lname?.[0] ?? ""}`.toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="font-heading font-semibold text-[26px] sm:text-[30px] leading-tight mb-1.5">
              {booking.fname} {booking.lname}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
              <StatusBadge status={booking.status.name} loading={isUpdating} />
              {status !== 1 && status !== 4 && (
                <span
                  className={`badge badge-soft rounded-full font-semibold text-[13px] ${
                    booking.is_paid ? "badge-success" : "badge-warning"
                  }`}
                >
                  {booking.is_paid ? "Payée" : "Non payée"}
                </span>
              )}
              <span>
                {apartment?.name ?? booking.apartment_id} · Réservation n°{" "}
                {booking.id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <button
                type="button"
                className={btnOutline}
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <IoMailOutline size={17} aria-hidden="true" />
                )}
                Renvoyer l&apos;e-mail
              </button>
              <button type="button" className={btnOutline} onClick={handleEditToggle}>
                <IoCreateOutline size={17} aria-hidden="true" />
                Modifier
              </button>
              {status === 1 && (
                <button
                  type="button"
                  className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
                  onClick={() => handleAction("confirm")}
                  disabled={!showConfirmBtn || isUpdating}
                >
                  Confirmer
                </button>
              )}
              {showPaymentBtn && (
                <button
                  type="button"
                  className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
                  onClick={() => handleAction("payment")}
                  disabled={isUpdating}
                >
                  Marquer payée
                </button>
              )}
              {status === 2 && booking.is_paid && (
                <button
                  type="button"
                  className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
                  onClick={() => handleAction("terminate")}
                  disabled={isUpdating}
                >
                  Terminer
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className={btnOutline}
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Enregistrer"
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {notice && !isEditing && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 sm:px-5 py-3.5 text-sm"
        >
          <IoTimeOutline size={18} className="shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}
      {errorMessage && (
        <div role="alert" className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}
      {resendError && (
        <div role="alert" className="alert alert-error">
          <span>{resendError}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-5 items-start">
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
          {/* Séjour */}
          <section className={card}>
            <h2 className="text-[17px] font-semibold mb-4">Séjour</h2>
            {!isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className={label}>Arrivée</p>
                  <p className="font-semibold">
                    {format(booking.arrival_date, "EEE d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className={label}>Départ</p>
                  <p className="font-semibold">
                    {format(booking.departure_date, "EEE d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className={label}>Durée</p>
                  <p className="font-semibold">
                    {stayNights} nuit{stayNights > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className={label}>Voyageurs</p>
                  <p className="font-semibold">
                    {booking.no_adults} adulte{booking.no_adults > 1 ? "s" : ""}
                    {(booking.no_childs ?? 0) > 0 &&
                      `, ${booking.no_childs} enfant${(booking.no_childs ?? 0) > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Dates</span>
                  <PopoverDatePicker
                    apartmentId={apartment?.slug ?? ""}
                    selectedRange={selectedRange}
                    onSelect={handleRangeSelect}
                    excludeRange={{
                      from: new Date(booking.arrival_date),
                      to: new Date(booking.departure_date),
                    }}
                    initialMonth={new Date(booking.arrival_date)}
                    className="w-full h-11 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Voyageurs</span>
                  <TravelersSelector
                    travelers={travelers}
                    setTravelers={(val) => {
                      setTravelers(val);
                      setFormValues((prev) => ({
                        ...prev,
                        no_adults: val.adults,
                        no_childs: val.children,
                      }));
                    }}
                    maxCapacity={apartment?.capacity ?? 1}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Client */}
          <section className={card}>
            <h2 className="text-[17px] font-semibold mb-4">Client</h2>
            {!isEditing ? (
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className={label}>E-mail</dt>
                  <dd>
                    {booking.mail ? (
                      <a href={`mailto:${booking.mail}`} className="link link-hover break-all">
                        {booking.mail}
                      </a>
                    ) : (
                      "Non renseigné"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className={label}>Téléphone</dt>
                  <dd>
                    {booking.phone ? (
                      <a href={`tel:${booking.phone}`} className="link link-hover">
                        {booking.phone}
                      </a>
                    ) : (
                      "Non renseigné"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className={label}>Adresse</dt>
                  <dd>
                    {booking.address || booking.postal_code || booking.city ? (
                      <>
                        {booking.address}
                        {booking.address && <br />}
                        {[booking.postal_code, booking.city].filter(Boolean).join(" ")}
                      </>
                    ) : (
                      "Non renseignée"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className={label}>Date de naissance</dt>
                  <dd>
                    {booking.birthdate
                      ? format(new Date(booking.birthdate), "dd.MM.yyyy", { locale: fr })
                      : "Non renseignée"}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">E-mail</span>
                  <input type="email" name="mail" className={input} value={formValues.mail} onChange={handleInputChange} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Téléphone</span>
                  <input type="tel" name="phone" className={input} value={formValues.phone} onChange={handleInputChange} />
                </label>
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-sm font-medium">Adresse</span>
                  <input type="text" name="address" className={input} value={formValues.address} onChange={handleInputChange} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">NPA</span>
                  <input type="text" name="postal_code" className={input} value={formValues.postal_code} onChange={handleInputChange} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Localité</span>
                  <input type="text" name="city" className={input} value={formValues.city} onChange={handleInputChange} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Date de naissance</span>
                  <input type="date" name="birthdate" className={input} value={formValues.birthdate} onChange={handleInputChange} />
                </label>
              </div>
            )}
          </section>
        </div>

        <div className="w-full xl:w-[360px] xl:shrink-0 flex flex-col gap-5">
          {/* Paiement */}
          <section className={`${card} flex flex-col gap-3.5`}>
            <h2 className="text-[17px] font-semibold">Paiement</h2>
            {!isEditing ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/65">Tarif</span>
                  <span>
                    {getCategory(booking.no_adults, apartment?.capacity ?? booking.no_adults)} ·{" "}
                    {stayNights} nuit{stayNights > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/65">Ménage</span>
                  <span>{booking.is_cleaning ? "Inclus" : "Non inclus"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/65">Statut</span>
                  <span>{booking.is_paid ? "Payée" : "Non payée"}</span>
                </div>
                <div className="border-t border-base-200 pt-3.5 flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="font-heading text-[28px] font-semibold">{chf(booking.price)}</span>
                </div>
              </>
            ) : (
              <>
                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                  <span>Calcul automatique</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm checked:bg-cta checked:border-cta"
                    checked={autoPrice}
                    onChange={(e) => setAutoPrice(e.target.checked)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Montant (CHF)</span>
                  <input
                    type="number"
                    name="price"
                    className={input}
                    value={formValues.price}
                    onChange={(e) => {
                      // toute saisie manuelle désactive l'auto si active
                      if (autoPrice) setAutoPrice(false);
                      handleInputChange(e);
                    }}
                  />
                </label>
                {suggestedPrice !== null && (
                  <p className="text-[13px] text-base-content/65">
                    Prix calculé : {chf(suggestedPrice)}
                  </p>
                )}
                {priceError && <p className="text-sm text-error">{priceError}</p>}
                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                  <span>Payée</span>
                  <input
                    type="checkbox"
                    name="is_paid"
                    className="toggle toggle-sm checked:bg-cta checked:border-cta"
                    checked={formValues.is_paid}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                  <span>Ménage inclus</span>
                  <input
                    type="checkbox"
                    name="is_cleaning"
                    className="toggle toggle-sm checked:bg-cta checked:border-cta"
                    checked={formValues.is_cleaning}
                    onChange={handleInputChange}
                  />
                </label>
              </>
            )}
          </section>

          {/* Informations */}
          <section className={card}>
            <h2 className="text-[17px] font-semibold mb-3">Informations</h2>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-base-content/65">N° de réservation</dt>
                <dd>{booking.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-base-content/65">Demande reçue le</dt>
                <dd>
                  {booking.created_at
                    ? format(new Date(booking.created_at), "d MMM yyyy, HH:mm", { locale: fr })
                    : "Non disponible"}
                </dd>
              </div>
            </dl>
          </section>

          {showCancelBtn && !isEditing && (
            <button
              type="button"
              className="btn h-11 rounded-xl btn-outline btn-error"
              onClick={() => handleAction("cancel")}
              disabled={isUpdating}
            >
              Annuler la réservation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
