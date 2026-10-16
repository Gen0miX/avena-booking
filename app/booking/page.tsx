"use client";

import {
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoImageOutline,
} from "react-icons/io5";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useEffect, useState, useRef, Suspense } from "react";
import TravelersSelector from "@/components/TravelersSelector";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import PopoverDatePicker from "@/components/PopoverDatePicker";
import {
  getPriceResult,
  getCategory,
  getNights,
} from "@/utils/priceCalculator";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
import { mutate } from "swr";
import { type BookingInput } from "@/lib/bookings";
import { APARTMENT_LIST, getApartmentBySlug, isApartmentSlug } from "@/config/apartments";
import Link from "next/link";

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  localite: string;
  dateNaissance: string;
}

interface FormErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  localite?: string;
  dateNaissance?: string;
}

export default function Booking() {
  // useSearchParams() below requires a Suspense boundary to avoid a
  // CSR-bailout build error; BookingForm carries all the real logic.
  return (
    <Suspense fallback={null}>
      <BookingForm />
    </Suspense>
  );
}

function BookingForm() {
  const searchParams = useSearchParams();
  const {
    range,
    setRange,
    travelers,
    setTravelers,
    apartmentSlug,
    setApartmentSlug,
  } = useBooking();

  // Resolve the apartment from the URL param on every change (not just on
  // mount): BookingProvider survives client-side navigation, so a visitor
  // who already picked an apartment in this session and then clicks
  // "Réserver" on a different apartment's page must still land on that new
  // apartment here, not keep whatever was resolved first.
  useEffect(() => {
    const fromUrl = searchParams.get("apartment");
    if (isApartmentSlug(fromUrl ?? "")) {
      if (fromUrl !== apartmentSlug) {
        setApartmentSlug(fromUrl as typeof apartmentSlug);
        setRange(undefined); // dates picked for the previous apartment don't carry meaning here (different occupancy, possibly different capacity)
      }
    } else if (!apartmentSlug) {
      setApartmentSlug(APARTMENT_LIST[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const apartment = apartmentSlug ? getApartmentBySlug(apartmentSlug) : undefined;

  const handleApartmentChange = (slug: string) => {
    if (!isApartmentSlug(slug)) return;
    setApartmentSlug(slug);
    setRange(undefined); // dates picked for the previous apartment don't carry meaning here (different occupancy, possibly different capacity)
    router.replace(`/booking?apartment=${slug}`, { scroll: false });
  };

  const { periods } = usePricingPeriods(apartment?.slug ?? null);
  const [price, setPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoPercent, setPromoPercent] = useState<number | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  // Ajout: conditions acceptées
  const [conditionsAccepted, setConditionsAccepted] = useState(false);

  // Form data et validation
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    localite: "",
    dateNaissance: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showValidation, setShowValidation] = useState(false);

  // Validation des champs
  const validateField = (
    name: keyof FormData,
    value: string,
  ): string | undefined => {
    switch (name) {
      case "nom":
      case "prenom":
        if (!value.trim())
          return `${name === "nom" ? "Le nom" : "Le prénom"} est requis`;
        if (value.trim().length < 2)
          return `${
            name === "nom" ? "Le nom" : "Le prénom"
          } doit contenir au moins 2 caractères`;
        break;
      case "email":
        if (!value.trim()) return "L'email est requis";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Format d'email invalide";
        break;
      case "telephone":
        if (!value.trim()) return "Le téléphone est requis";
        const phoneRegex = /^[+]?[\d\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, "")))
          return "Format de téléphone invalide";
        break;
      case "adresse":
        if (!value.trim()) return "L'adresse est requise";
        if (value.trim().length < 5)
          return "L'adresse doit contenir au moins 5 caractères";
        break;
      case "codePostal":
        if (!value.trim()) return "Le code postal est requis";
        if (!/^[0-9]{4,6}$/.test(value.trim()))
          return "Code postal invalide (4-6 chiffres)";
        break;
      case "localite":
        if (!value.trim()) return "La localité est requise";
        if (value.trim().length < 2)
          return "La localité doit contenir au moins 2 caractères";
        break;
      case "dateNaissance":
        if (!value.trim()) return "La date de naissance est requise";
        const birthDate = new Date(value);
        const today = new Date();
        if (isNaN(birthDate.getTime())) return "Date invalide";
        if (birthDate >= today)
          return "La date de naissance doit être dans le passé";
        break;
    }
    return undefined;
  };

  // Gestion des changements de champs
  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (showValidation) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Validation complète
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        hasErrors = true;
      }
    });

    setFormErrors(errors);
    return !hasErrors;
  };

  // Vérifier si le formulaire est valide
  const isFormValid = (): boolean | undefined => {
    return (
      (Object.keys(formData) as Array<keyof FormData>).every(
        (key) => !validateField(key, formData[key]),
      ) &&
      range?.from &&
      range?.to &&
      travelers.adults > 0 &&
      price !== null &&
      !priceError &&
      conditionsAccepted
    );
  };

  // Calcul du prix
  useEffect(() => {
    setIsClient(true);
    if (!apartment) return;
    if (range?.from && range?.to && travelers.adults > 0) {
      const { price: calculatedPrice, error } = getPriceResult({
        start: range.from,
        end: range.to,
        adults: travelers.adults,
        customPeriods: periods,
        apartment,
      });

      if (error) {
        setPriceError(error);
        setPrice(null);
        // reset promo si le prix de base devient invalide
        setPromoPercent(null);
        setDiscountedPrice(null);
      } else {
        setPriceError(null);
        // ménage toujours inclus → pas de toggle
        setPrice(calculatedPrice || null);
        // si un code promo est appliqué, recalculer
        if (calculatedPrice && promoPercent) {
          const newDiscounted = Math.max(
            0,
            Math.round(calculatedPrice * (1 - promoPercent / 100)),
          );
          setDiscountedPrice(newDiscounted);
        }
      }
    } else {
      setPrice(null);
      setPriceError(null);
      setPromoPercent(null);
      setDiscountedPrice(null);
    }
  }, [range, travelers, periods, apartment]);

  // Invalider la promo si on modifie le code saisi ou les dates : un code
  // vérifié pour une période n'est pas forcément valide pour une autre
  // (règle de mois), donc on force une nouvelle vérification explicite.
  useEffect(() => {
    setPromoError(null);
    setPromoPercent(null);
    setDiscountedPrice(null);
  }, [promoCode, range]);

  const handleCheckPromo = async () => {
    if (!apartment) return;
    if (!range?.from || !range?.to || !price) {
      setPromoError("Sélectionnez d'abord vos dates et voyageurs");
      return;
    }
    if (!promoCode.trim()) {
      setPromoError("Entrez un code promo");
      return;
    }
    setPromoChecking(true);
    setPromoError(null);
    try {
      const arrivalDateString = range.from.toLocaleDateString("en-CA");
      const departureDateString = range.to.toLocaleDateString("en-CA");
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          arrival_date: arrivalDateString,
          departure_date: departureDateString,
          apartment_id: apartment.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data?.reason || "Erreur lors de la vérification");
        setPromoPercent(null);
        setDiscountedPrice(null);
        return;
      }
      if (!data.active) {
        setPromoError(data?.reason || "Code non valide");
        setPromoPercent(null);
        setDiscountedPrice(null);
        return;
      }
      const percent = Number(data.percentage) || 0;
      setPromoPercent(percent);
      const newDiscounted = Math.max(
        0,
        Math.round(price * (1 - percent / 100)),
      );
      setDiscountedPrice(newDiscounted);
    } catch (e) {
      setPromoError("Erreur lors de la vérification");
      setPromoPercent(null);
      setDiscountedPrice(null);
    } finally {
      setPromoChecking(false);
    }
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setShowValidation(true);
    const formValid = validateForm();

    if (!isFormValid() || !formValid) {
      setSubmitMessage("Veuillez corriger les erreurs du formulaire");
      return;
    }

    if (!apartment) {
      setSubmitMessage("Veuillez sélectionner un appartement");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const token = await recaptchaRef.current?.executeAsync();
      if (!token) {
        setSubmitMessage("Erreur de validation du CAPTCHA");
        setIsSubmitting(false);
        return;
      }

      const arrivalDateString = range!.from!.toLocaleDateString("en-CA");
      const departureDateString = range!.to!.toLocaleDateString("en-CA");

      const bookingData: BookingInput = {
        apartment_id: apartment.slug,
        fname: formData.prenom,
        lname: formData.nom,
        mail: formData.email,
        phone: formData.telephone,
        address: formData.adresse,
        postal_code: formData.codePostal,
        city: formData.localite,
        birthdate: formData.dateNaissance,
        no_adults: travelers.adults,
        no_childs: travelers.children || 0,
        status: 1,
        arrival_date: arrivalDateString,
        departure_date: departureDateString,
        price: discountedPrice ?? price!,
        is_cleaning: true, // toujours inclus
        ...(promoPercent !== null ? { promo_code: promoCode.trim() } : {}),
      };

      console.log(
        "Booking data date :",
        bookingData.arrival_date + " to " + bookingData.departure_date,
      );

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingData, token }),
      });

      if (response.ok) {
        const booking = await response.json();
        mutate(`/api/bookings/occupied-dates?apartment=${apartment.slug}`);
        router.push(`/confirmation/${booking.id}`);
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          adresse: "",
          codePostal: "",
          localite: "",
          dateNaissance: "",
        });
        setRange(undefined);
        setTravelers({ adults: 1, children: 0 });
        setConditionsAccepted(false);
        setShowValidation(false);
        setFormErrors({});
      } else {
        const errorData = await response.json();
        setSubmitMessage(
          errorData.message || "Erreur lors de la création de la réservation",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSubmitMessage("Erreur lors de la soumission du formulaire");
    } finally {
      recaptchaRef.current?.reset();
      setIsSubmitting(false);
    }
  };

  if (!apartment) {
    return null; // one render tick while the mount effect above resolves the initial apartment
  }

  const chf = (value: number) =>
    value.toLocaleString("fr-CH", { style: "currency", currency: "CHF" });
  const formatDay = (d: Date) =>
    d.toLocaleDateString("fr-CH", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const fieldProps = (name: keyof FormData) => ({
    value: formData[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleInputChange(name, e.target.value),
    error: showValidation ? formErrors[name] : undefined,
  });

  return (
    <div className="flex flex-col min-h-screen bg-base-100 text-base-content">
      <NavBar />
      <main className="flex-1 w-full max-w-[1328px] mx-auto px-4 sm:px-8 lg:px-14 pt-6 sm:pt-10 pb-16 sm:pb-24">
        <Link
          href={`/appartements/${apartment.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-base-content/70 py-2.5 hover:text-base-content"
        >
          <IoArrowBackOutline size={16} aria-hidden="true" />
          Retour à l&apos;appartement
        </Link>
        <h1 className="font-heading font-semibold text-[34px] sm:text-5xl lg:text-[56px] leading-[1.08] mt-2 mb-2">
          Demande de réservation
        </h1>
        <p className="text-base sm:text-[17px] text-base-content/75 mb-8 sm:mb-10">
          Vous recevrez une confirmation et une facture QR par e-mail.
        </p>

        {submitMessage && (
          <div
            role="alert"
            className={`alert ${
              submitMessage.includes("succès") ? "alert-success" : "alert-error"
            } mb-6`}
          >
            <span>{submitMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-5 lg:gap-10 items-start"
        >
          <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
            {/* 1. Séjour */}
            <fieldset className={card}>
              <Step n={1}>Votre séjour</Step>
              <div
                role="radiogroup"
                aria-label="Appartement"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {APARTMENT_LIST.map((a) => {
                  const selected = a.slug === apartment.slug;
                  return (
                    <label
                      key={a.slug}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl border-2 cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                        selected
                          ? "border-cta bg-cta/10"
                          : "border-base-300 hover:border-base-content/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="appartement"
                        value={a.slug}
                        checked={selected}
                        onChange={() => handleApartmentChange(a.slug)}
                        className="sr-only"
                      />
                      <span className="relative size-16 sm:size-[72px] rounded-xl overflow-hidden bg-base-300 shrink-0 flex items-center justify-center text-cta">
                        {a.gallery[0] ? (
                          <Image
                            src={a.gallery[0].src}
                            alt=""
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        ) : (
                          <IoImageOutline size={24} aria-hidden="true" />
                        )}
                      </span>
                      <span className="flex flex-col flex-1">
                        <span className="font-semibold">{a.name}</span>
                        <span className="text-sm text-base-content/75">
                          Jusqu&apos;à {a.capacity} personnes
                        </span>
                      </span>
                      {selected && (
                        <IoCheckmarkCircle
                          size={24}
                          className="text-cta shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-sm font-medium">Dates</span>
                  <PopoverDatePicker
                    apartmentId={apartment.slug}
                    selectedRange={range}
                    onSelect={setRange}
                    className="w-full h-12 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-sm font-medium">Voyageurs</span>
                  <TravelersSelector
                    travelers={travelers}
                    setTravelers={setTravelers}
                    maxCapacity={apartment.capacity}
                  />
                </div>
              </div>
            </fieldset>

            {/* 2. Coordonnées */}
            <fieldset className={card}>
              <Step n={2}>Vos coordonnées</Step>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Prénom"
                  autoComplete="given-name"
                  {...fieldProps("prenom")}
                />
                <TextField
                  label="Nom"
                  autoComplete="family-name"
                  {...fieldProps("nom")}
                />
                <TextField
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  {...fieldProps("email")}
                />
                <TextField
                  label="Téléphone"
                  type="tel"
                  autoComplete="tel"
                  pattern="[0-9+\-\s\(\)]+"
                  inputClassName="tabular-nums"
                  {...fieldProps("telephone")}
                />
              </div>
              <TextField
                label="Adresse"
                autoComplete="street-address"
                {...fieldProps("adresse")}
              />
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.5fr)] gap-4">
                <TextField
                  label="NPA"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  inputClassName="tabular-nums"
                  {...fieldProps("codePostal")}
                />
                <TextField
                  label="Localité"
                  autoComplete="address-level2"
                  {...fieldProps("localite")}
                />
                <TextField
                  label="Date de naissance"
                  type="date"
                  autoComplete="bday"
                  className="col-span-2 sm:col-span-1"
                  {...fieldProps("dateNaissance")}
                />
              </div>
            </fieldset>

            {/* 3. Confirmation */}
            <fieldset className={card}>
              <Step n={3}>Confirmation</Step>
              <label className="flex items-start gap-3 text-[15px] leading-normal cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm mt-0.5 checked:bg-cta checked:border-cta checked:text-cta-content"
                  checked={conditionsAccepted}
                  onChange={(e) => setConditionsAccepted(e.target.checked)}
                  required
                />
                <span>
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <Link
                    href="/conditions-generales"
                    className="link"
                    target="_blank"
                  >
                    conditions générales
                  </Link>
                  .
                </span>
              </label>
            </fieldset>
          </div>

          {/* Récapitulatif */}
          <aside
            aria-label="Récapitulatif"
            className="w-full lg:w-[400px] lg:shrink-0 lg:sticky lg:top-6 bg-surface rounded-2xl shadow-[0_16px_40px_rgba(43,50,64,0.12)] overflow-hidden"
          >
            {apartment.gallery[0] && (
              <div className="relative h-40 hidden lg:block">
                <Image
                  src={apartment.gallery[0].src}
                  alt=""
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-5 sm:p-7 flex flex-col gap-4">
              <div>
                <h2 className="font-heading text-[26px] font-semibold">
                  {apartment.name}
                </h2>
                <p className="text-sm text-base-content/70">
                  Saas-Fee · Jusqu&apos;à {apartment.capacity} personnes
                </p>
              </div>

              {priceError && (
                <div role="alert" className="alert alert-error py-2.5">
                  <span className="text-sm">{priceError}</span>
                </div>
              )}

              {range?.from && range?.to && travelers.adults > 0 && !priceError ? (
                <>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[15px]">
                    <dt className="text-base-content/70">Arrivée</dt>
                    <dd className="text-right">{formatDay(range.from)}</dd>
                    <dt className="text-base-content/70">Départ</dt>
                    <dd className="text-right">{formatDay(range.to)}</dd>
                    <dt className="text-base-content/70">Voyageurs</dt>
                    <dd className="text-right">
                      {travelers.adults} adulte{travelers.adults > 1 ? "s" : ""}
                      {travelers.children > 0 &&
                        `, ${travelers.children} enfant${travelers.children > 1 ? "s" : ""}`}
                    </dd>
                    <dt className="text-base-content/70">Tarif</dt>
                    <dd className="text-right">
                      {getCategory(travelers.adults, apartment.capacity)} ·{" "}
                      {getNights(range.from, range.to)} nuits
                    </dd>
                  </dl>

                  <div>
                    <div className="flex gap-2">
                      <label className="flex-1 min-w-0">
                        <span className="sr-only">Code promo</span>
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Code promo"
                          className="input w-full h-11 rounded-xl"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleCheckPromo}
                        disabled={promoChecking || !price}
                        className="btn btn-outline h-11 rounded-xl border-base-300"
                      >
                        {promoChecking ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          "Appliquer"
                        )}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-error text-xs mt-1.5">{promoError}</p>
                    )}
                  </div>

                  <div className="border-t border-base-200 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[17px] font-semibold">Total</span>
                      <span className="text-right">
                        {discountedPrice && promoPercent ? (
                          <>
                            <span className="block text-sm line-through text-base-content/60">
                              {price !== null && chf(price)}
                            </span>
                            <span className="font-heading text-[30px] font-semibold">
                              {chf(discountedPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="font-heading text-[30px] font-semibold">
                            {price !== null && chf(price)}
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-right text-[13px] text-base-content/65">
                      {discountedPrice && promoPercent
                        ? `-${promoPercent}% appliqué · `
                        : ""}
                      Ménage et taxes inclus
                    </p>
                  </div>
                </>
              ) : (
                !priceError && (
                  <p className="text-[15px] text-base-content/65">
                    Sélectionnez une période et le nombre de voyageurs pour
                    voir le prix.
                  </p>
                )
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn h-auto min-h-12 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90 text-base"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer la demande"
                )}
              </button>
            </div>
          </aside>

          {isClient && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              size="invisible"
              ref={recaptchaRef}
            />
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}

const card = "bg-surface rounded-2xl p-5 sm:p-7 flex flex-col gap-5 min-w-0";

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <legend className="float-left w-full flex items-center gap-3 text-lg sm:text-xl font-semibold">
      <span
        aria-hidden="true"
        className="size-8 rounded-full bg-base-content text-base-100 text-[15px] flex items-center justify-center"
      >
        {n}
      </span>
      {children}
    </legend>
  );
}

function TextField({
  label,
  error,
  className = "",
  inputClassName = "",
  ...inputProps
}: {
  label: string;
  error?: string;
  className?: string;
  inputClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <input
        type="text"
        required
        aria-invalid={error ? true : undefined}
        {...inputProps}
        className={`input w-full h-12 rounded-xl ${
          error ? "input-error" : ""
        } ${inputClassName}`}
      />
      {error && <span className="text-error text-sm">{error}</span>}
    </label>
  );
}
