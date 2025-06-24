"use client";

import {
  IoPersonCircleOutline,
  IoCalendarOutline,
  IoMailOutline,
} from "react-icons/io5";
import { HiOutlinePhone } from "react-icons/hi";
import { useBooking } from "@/context/BookingContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useEffect, useState, useRef } from "react";
import CustomDayPicker from "@/components/CustomDayPicker";
import TravelersSelector from "@/components/TravelersSelector";
import NavBar from "@/components/NavBar";
import PopoverDatePicker from "@/components/PopoverDatePicker";
import {
  getPriceResult,
  isHighSeason,
  isFamilyRate,
  getNights,
} from "@/utils/priceCalculator";
import { mutate } from "swr";
import { type BookingInput } from "@/lib/bookings";

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface FormErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
}

export default function Booking() {
  const { range, setRange, travelers, setTravelers } = useBooking();
  const [price, setPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [menage, setMenage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Form data et validation
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showValidation, setShowValidation] = useState(false);

  // Validation des champs
  const validateField = (
    name: keyof FormData,
    value: string
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
    }
    return undefined;
  };

  // Gestion des changements de champs
  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si on a déjà tenté de soumettre, on valide en temps réel
    if (showValidation) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Validation complète du formulaire
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

  // Vérifier si le formulaire est valide (sans afficher les erreurs)
  const isFormValid = (): boolean | undefined => {
    return (
      (Object.keys(formData) as Array<keyof FormData>).every(
        (key) => !validateField(key, formData[key])
      ) &&
      range?.from &&
      range?.to &&
      travelers.adults > 0 &&
      price !== null &&
      !priceError
    );
  };

  // Calcul du prix avec gestion des erreurs
  useEffect(() => {
    setIsClient(true);
    if (range?.from && range?.to && travelers.adults > 0) {
      const { price: calculatedPrice, error } = getPriceResult({
        start: range.from,
        end: range.to,
        adults: travelers.adults,
      });

      if (error) {
        setPriceError(error);
        setPrice(null);
      } else {
        setPriceError(null);
        // Ajouter 100 CHF si ménage est coché
        const finalPrice = calculatedPrice
          ? calculatedPrice + (menage ? 100 : 0)
          : null;
        setPrice(finalPrice);
      }
    } else {
      setPrice(null);
      setPriceError(null);
    }
  }, [range, travelers, menage]);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Activer l'affichage des erreurs et valider
    setShowValidation(true);
    const formValid = validateForm();

    if (!isFormValid() || !formValid) {
      setSubmitMessage("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const token = await recaptchaRef.current?.executeAsync();
      recaptchaRef.current?.reset();
      if (!token) {
        setSubmitMessage("Erreur de validation du CAPTCHA");
        setIsSubmitting(false);
        return;
      }

      const bookingData: BookingInput = {
        fname: formData.prenom,
        lname: formData.nom,
        mail: formData.email,
        phone: formData.telephone,
        no_adults: travelers.adults,
        no_childs: travelers.children || 0,
        status: 1,
        arrival_date: range!.from!,
        departure_date: range!.to!,
        price: price!,
        is_cleaning: menage,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingData, token }),
      });

      if (response.ok) {
        mutate("/api/bookings/occupied-dates");
        setSubmitMessage("Réservation créée avec succès !");
        // Réinitialiser le formulaire
        setFormData({ nom: "", prenom: "", email: "", telephone: "" });
        setRange(undefined);
        setTravelers({ adults: 1, children: 0 });
        setMenage(false);
        setShowValidation(false);
        setFormErrors({});
      } else {
        const errorData = await response.json();
        setSubmitMessage(
          errorData.message || "Erreur lors de la création de la réservation"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSubmitMessage("Erreur lors de la soumission du formulaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavBar />
      <form onSubmit={handleSubmit}>
        <section className="flex flex-col items-center bg-base-200 lg:max-w-6xl mx-2 md:mx-5 lg:mx-10 xl:mx-auto mt-24 rounded-box border border-primary/40">
          <h1 className="font-heading text-4xl font-semibold mt-5">
            Réservation
          </h1>

          {submitMessage && (
            <div
              className={`alert ${
                submitMessage.includes("succès")
                  ? "alert-success"
                  : "alert-error"
              } mt-4 mx-4`}
            >
              <span>{submitMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pb-5 pt-5 sm:pt-5 sm:pb-5 px-2">
            <fieldset className="fieldset bg-base-300 border-primary/40 rounded-box border p-2 sm:p-4 shadow-lg">
              <legend className="fieldset-legend text-xl font-medium">
                Données personnelles
              </legend>

              <div className="flex flex-col lg:flex-row gap-2">
                <label
                  className={`input validator input-primary lg:flex-1 ${
                    showValidation && formErrors.prenom ? "input-error" : ""
                  }`}
                >
                  <IoPersonCircleOutline className="text-xl text-base-content/70" />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={(e) =>
                      handleInputChange("prenom", e.target.value)
                    }
                    className=""
                    required
                  />
                </label>
                <label
                  className={`input validator input-primary lg:flex-1 ${
                    showValidation && formErrors.nom ? "input-error" : ""
                  }`}
                >
                  <IoPersonCircleOutline className="text-xl validator text-base-content/70" />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    className=""
                    required
                  />
                </label>
              </div>

              {/* Messages d'erreur pour nom/prénom */}
              <div className="flex flex-col lg:flex-row gap-2">
                {showValidation && formErrors.nom && (
                  <div className="text-error text-sm lg:flex-1">
                    {formErrors.nom}
                  </div>
                )}
                {showValidation && formErrors.prenom && (
                  <div className="text-error text-sm lg:flex-1">
                    {formErrors.prenom}
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-2">
                <label
                  className={`input input-primary validator lg:flex-1 ${
                    showValidation && formErrors.email ? "input-error" : ""
                  }`}
                >
                  <IoMailOutline className="text-xl text-base-content/70" />
                  <input
                    type="email"
                    placeholder="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </label>

                <label
                  className={`input validator input-primary lg:flex-1 ${
                    showValidation && formErrors.telephone ? "input-error" : ""
                  }`}
                >
                  <HiOutlinePhone className="text-xl text-base-content/70" />
                  <input
                    type="tel"
                    placeholder="téléphone"
                    value={formData.telephone}
                    onChange={(e) =>
                      handleInputChange("telephone", e.target.value)
                    }
                    className="validator tabular-nums"
                    required
                  />
                </label>
              </div>

              {/* Messages d'erreur pour email/téléphone */}
              <div className="flex flex-col lg:flex-row gap-2">
                {showValidation && formErrors.email && (
                  <div className="text-error text-sm lg:flex-1">
                    {formErrors.email}
                  </div>
                )}
                {showValidation && formErrors.telephone && (
                  <div className="text-error text-sm lg:flex-1">
                    {formErrors.telephone}
                  </div>
                )}
              </div>

              <TravelersSelector
                travelers={travelers}
                setTravelers={setTravelers}
              />

              <PopoverDatePicker
                selectedRange={range}
                onSelect={setRange}
                className="w-full"
              />

              <label className="label cursor-pointer">
                <span className="label-text">Ménage (+100 CHF)</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={menage}
                  onChange={(e) => setMenage(e.target.checked)}
                />
              </label>
            </fieldset>

            <fieldset className="fieldset bg-base-300 border-primary/40 rounded-box border p-2 sm:p-4 shadow-lg w-full sm:w-52">
              <legend className="fieldset-legend text-xl font-medium">
                Prix
              </legend>

              {priceError ? (
                <div className="alert alert-error">
                  <span className="text-sm">{priceError}</span>
                </div>
              ) : range?.from && range?.to && travelers.adults > 0 ? (
                <>
                  <p>
                    <span className="font-semibold">Saison :</span>{" "}
                    {isHighSeason(range.from, range.to) ? "Haute" : "Basse"}
                  </p>
                  <p>
                    <span className="font-semibold">Tarif :</span>{" "}
                    {isFamilyRate(travelers.adults) ? "Famille" : "Plein"}
                  </p>
                  <p>
                    <span className="font-semibold">Nuits :</span>{" "}
                    {getNights(range.from, range.to)}
                  </p>
                  {menage && (
                    <p>
                      <span className="font-semibold">Ménage :</span> +100 CHF
                    </p>
                  )}
                  <div className="divider my-0"></div>
                  <p className="text-center text-lg font-medium">
                    <span className="font-semibold">
                      Prix total <br />
                    </span>
                    {price?.toLocaleString("fr-CH", {
                      style: "currency",
                      currency: "CHF",
                    })}
                  </p>
                </>
              ) : (
                <p className="text-base-content/50">
                  Sélectionnez une période et le nombre de voyageurs.
                </p>
              )}
            </fieldset>
          </div>

          <button
            type="submit"
            className={`btn btn-primary mb-5 ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Réserver"}
          </button>
        </section>
        {isClient && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            size="invisible"
            ref={recaptchaRef}
          />
        )}
      </form>

      <div
        popover="auto"
        id="rdp-popover"
        className="dropdown"
        style={{ positionAnchor: "--rdp" } as React.CSSProperties}
      >
        <CustomDayPicker
          mode="selectable"
          selectedRange={range}
          onSelect={setRange}
        />
      </div>
    </>
  );
}
