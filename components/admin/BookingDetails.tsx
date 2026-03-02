"use client";

import { useEffect, useState } from "react";
import useBooking from "@/hooks/useBooking";
import { useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatusBadge from "@/components/admin/StatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import PopoverDatePicker from "@/components/PopoverDatePicker";
import TravelersSelector from "@/components/TravelersSelector";
import { Travelers } from "@/lib/bookings";
import { getPriceResult, getNights } from "@/utils/priceCalculator";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
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
  const { booking, loading, updateBooking, refresh } = useBooking(bookingId);
  const { updateBookingStatus } = useBookings();
  const { periods } = usePricingPeriods();
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
    if (!isEditing) return;
    const start = selectedRange?.from
      ? new Date(selectedRange.from)
      : undefined;
    const end = selectedRange?.to ? new Date(selectedRange.to) : undefined;
    const adults = travelers.adults;

    const { price, error } = getPriceResult({ start, end, adults, customPeriods: periods });
    setPriceError(error);
    setSuggestedPrice(price);

    if (autoPrice && price !== null) {
      setFormValues((prev) => ({ ...prev, price }));
    }
  }, [isEditing, selectedRange, travelers.adults, autoPrice, periods]);

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
        <div className="loading loading-dots loading-lg text-primary"></div>
      </div>
    );
  }

  const status = booking.status.id;
  const showConfirmBtn = status === 1 || status === 2;
  const showCancelBtn = status === 1 || status === 2;
  const showPaymentBtn = !booking.is_paid && status === 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
              <div className="mt-3 flex justify-end gap-2">
                {!isEditing ? (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={handleEditToggle}
                    >
                      <FaEdit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleResendEmail}
                      disabled={isResending}
                      title="Renvoyer l'email de réservation"
                    >
                      {isResending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Renvoyer l'email"
                      )}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={handleEditToggle}
                      disabled={isSaving}
                    >
                      Annuler
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Enregistrer"
                      )}
                    </button>
                  </div>
                )}
              </div>
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
          {errorMessage && (
            <div className="alert alert-error mt-4">
              <span>{errorMessage}</span>
            </div>
          )}
          {resendError && (
            <div className="alert alert-error mt-2">
              <span>{resendError}</span>
            </div>
          )}
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
                {!isEditing ? (
                  <div className="text-lg">
                    {format(booking.arrival_date, "EEEE dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </div>
                ) : null}
              </div>
              <div>
                <label className="font-semibold text-sm">Départ</label>
                {!isEditing ? (
                  <div className="text-lg">
                    {format(booking.departure_date, "EEEE dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </div>
                ) : null}
              </div>
              {isEditing && (
                <div>
                  <PopoverDatePicker
                    selectedRange={selectedRange}
                    onSelect={handleRangeSelect}
                    excludeRange={{
                      from: new Date(booking.arrival_date),
                      to: new Date(booking.departure_date),
                    }}
                    initialMonth={new Date(booking.arrival_date)}
                    className="mt-2 w-full max-w-xs"
                  />
                </div>
              )}
              <div>
                <label className="font-semibold text-sm">Durée</label>
                <div className="text-lg">
                  {getNights(new Date(booking.arrival_date), new Date(booking.departure_date))}{" "}
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
              {!isEditing ? (
                <>
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
                </>
              ) : (
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
                />
              )}
              <div>
                <label className="font-semibold text-sm">Total</label>
                <div className="text-lg font-semibold">
                  {isEditing
                    ? travelers.adults + travelers.children
                    : booking.no_adults + (booking.no_childs ?? 0)}{" "}
                  personnes
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
              {!isEditing ? (
                <div className="text-lg">{booking.mail || "Non renseigné"}</div>
              ) : (
                <input
                  type="email"
                  name="mail"
                  className="input input-bordered w-full"
                  value={formValues.mail}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <label className="font-semibold text-sm">Téléphone</label>
              {!isEditing ? (
                <div className="text-lg">
                  {booking.phone || "Non renseigné"}
                </div>
              ) : (
                <input
                  type="tel"
                  name="phone"
                  className="input input-bordered w-full"
                  value={formValues.phone}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <label className="font-semibold text-sm">Adresse</label>
              {!isEditing ? (
                <div className="text-lg">
                  {booking.address || "Non renseigné"}
                </div>
              ) : (
                <input
                  type="text"
                  name="address"
                  className="input input-bordered w-full"
                  value={formValues.address}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <label className="font-semibold text-sm">Code postal</label>
              {!isEditing ? (
                <div className="text-lg">
                  {booking.postal_code || "Non renseigné"}
                </div>
              ) : (
                <input
                  type="text"
                  name="postal_code"
                  className="input input-bordered w-full"
                  value={formValues.postal_code}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <label className="font-semibold text-sm">Localité</label>
              {!isEditing ? (
                <div className="text-lg">
                  {booking.city || "Non renseigné"}
                </div>
              ) : (
                <input
                  type="text"
                  name="city"
                  className="input input-bordered w-full"
                  value={formValues.city}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div>
              <label className="font-semibold text-sm">Date de naissance</label>
              {!isEditing ? (
                <div className="text-lg">
                  {booking.birthdate
                    ? format(new Date(booking.birthdate), "dd/MM/yyyy", {
                        locale: fr,
                      })
                    : "Non renseigné"}
                </div>
              ) : (
                <input
                  type="date"
                  name="birthdate"
                  className="input input-bordered w-full"
                  value={formValues.birthdate}
                  onChange={handleInputChange}
                />
              )}
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
            <div className="md:col-span-2 grid md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="font-semibold">Prix</label>
                {!isEditing ? (
                  <div>{booking.price} CHF</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="toggle toggle-accent"
                        checked={autoPrice}
                        onChange={(e) => setAutoPrice(e.target.checked)}
                      />
                      <span>Calcul automatique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="price"
                        className="input input-bordered w-full max-w-xs"
                        value={formValues.price}
                        onChange={(e) => {
                          // toute saisie manuelle désactive l'auto si active
                          if (autoPrice) setAutoPrice(false);
                          handleInputChange(e);
                        }}
                      />
                      {suggestedPrice !== null && (
                        <>
                          <span>Auto:</span>
                          <span className="badge badge-accent">
                            {suggestedPrice}
                          </span>
                        </>
                      )}
                    </div>
                    {priceError && (
                      <div className="text-sm text-error">{priceError}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold">Payée</label>
                {!isEditing ? (
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={booking.is_paid}
                    readOnly
                  />
                ) : (
                  <input
                    type="checkbox"
                    name="is_paid"
                    className="toggle"
                    checked={formValues.is_paid}
                    onChange={handleInputChange}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold">Ménage</label>
                {!isEditing ? (
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={!!booking.is_cleaning}
                    readOnly
                  />
                ) : (
                  <input
                    type="checkbox"
                    name="is_cleaning"
                    className="toggle"
                    checked={formValues.is_cleaning}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
