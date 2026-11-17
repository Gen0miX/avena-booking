"use client";

import { useState, useEffect } from "react";
import {
  PERIOD_PRICE_FIELDS,
  PricingPeriod,
  PricingPeriodInput,
} from "@/lib/pricingPeriods";
import {
  ApartmentSlug,
  getApartmentBySlug,
  getRateTableColumns,
} from "@/config/apartments";

interface PricingPeriodFormProps {
  apartmentSlug: ApartmentSlug;
  initialData?: PricingPeriod | null;
  onSubmit: (data: PricingPeriodInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
  existingPeriods: PricingPeriod[];
}

export default function PricingPeriodForm({
  apartmentSlug,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  existingPeriods,
}: PricingPeriodFormProps) {
  const [formData, setFormData] = useState<PricingPeriodInput>({
    apartment_id: apartmentSlug,
    name: "",
    start_date: "",
    end_date: "",
    price_up_to_2: 200,
    price_up_to_4: 280,
    price_up_to_6: 320,
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const apartment = getApartmentBySlug(apartmentSlug);
  // Mêmes libellés que la grille saisonnière (« Jusqu'à 2 / 4 / 6 pers. »)
  const columns = apartment ? getRateTableColumns(apartment) : [];
  const fallbackLabels = ["Jusqu'à 2 pers.", "Jusqu'à 4 pers.", "Jusqu'à 6 pers."];
  const priceLabel = (i: number) => columns[i]?.label ?? fallbackLabels[i];

  useEffect(() => {
    if (initialData) {
      setFormData({
        apartment_id: apartmentSlug,
        name: initialData.name,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        price_up_to_2: initialData.price_up_to_2,
        price_up_to_4: initialData.price_up_to_4,
        price_up_to_6: initialData.price_up_to_6,
      });
    }
  }, [initialData, apartmentSlug]);

  const checkOverlap = (): boolean => {
    const periodsToCheck = existingPeriods.filter(
      (p) => p.id !== initialData?.id
    );

    for (const period of periodsToCheck) {
      if (
        formData.start_date < period.end_date &&
        formData.end_date > period.start_date
      ) {
        setLocalError(`Cette période chevauche "${period.name}"`);
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!formData.name.trim()) {
      setLocalError("Le nom est requis");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setLocalError("Les dates sont requises");
      return;
    }
    if (formData.end_date <= formData.start_date) {
      setLocalError("La date de fin doit être après la date de début");
      return;
    }
    if (PERIOD_PRICE_FIELDS.some((f) => !(formData[f] > 0))) {
      setLocalError("Les prix doivent être positifs");
      return;
    }

    // Vérifier les chevauchements
    if (checkOverlap()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    setLocalError(null);
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div className="alert alert-error">
          <span>{displayError}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label pb-1.5">
          <span className="text-sm font-medium">Nom de la période</span>
        </label>
        <input
          type="text"
          name="name"
          className="input w-full h-11 rounded-xl bg-surface"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Haute saison hiver 2025"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label pb-1.5">
            <span className="text-sm font-medium">Date de début</span>
          </label>
          <input
            type="date"
            name="start_date"
            className="input w-full h-11 rounded-xl bg-surface"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label pb-1.5">
            <span className="text-sm font-medium">
              Date de fin (exclusive)
            </span>
          </label>
          <input
            type="date"
            name="end_date"
            className="input w-full h-11 rounded-xl bg-surface"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium mb-1.5">
          Prix par nuit (CHF), enfants compris
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERIOD_PRICE_FIELDS.map((field, i) => (
            <label key={field} className="flex flex-col gap-1.5">
              <span className="text-sm text-base-content/75">{priceLabel(i)}</span>
              <input
                type="number"
                name={field}
                className="input w-full h-11 rounded-xl bg-surface"
                value={formData[field]}
                onChange={handleChange}
                min="1"
                step="1"
                required
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          className="btn h-11 rounded-xl btn-outline border-base-300"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : initialData ? (
            "Enregistrer"
          ) : (
            "Créer"
          )}
        </button>
      </div>
    </form>
  );
}
