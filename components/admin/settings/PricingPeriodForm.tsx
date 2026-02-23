"use client";

import { useState, useEffect } from "react";
import { PricingPeriod, PricingPeriodInput } from "@/lib/pricingPeriods";

interface PricingPeriodFormProps {
  initialData?: PricingPeriod | null;
  onSubmit: (data: PricingPeriodInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
  existingPeriods: PricingPeriod[];
}

export default function PricingPeriodForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  existingPeriods,
}: PricingPeriodFormProps) {
  const [formData, setFormData] = useState<PricingPeriodInput>({
    name: "",
    start_date: "",
    end_date: "",
    price_standard: 200,
    price_five: 250,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        price_standard: initialData.price_standard,
        price_five: initialData.price_five,
      });
    }
  }, [initialData]);

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
    if (formData.price_standard <= 0 || formData.price_five <= 0) {
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
        <label className="label">
          <span className="label-text font-semibold">Nom de la période</span>
        </label>
        <input
          type="text"
          name="name"
          className="input input-bordered w-full"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Haute saison hiver 2025"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Date de début</span>
          </label>
          <input
            type="date"
            name="start_date"
            className="input input-bordered w-full"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Date de fin (exclusive)
            </span>
          </label>
          <input
            type="date"
            name="end_date"
            className="input input-bordered w-full"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Prix standard (1-4 adultes) CHF
            </span>
          </label>
          <input
            type="number"
            name="price_standard"
            className="input input-bordered w-full"
            value={formData.price_standard}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Prix 5 adultes CHF</span>
          </label>
          <input
            type="number"
            name="price_five"
            className="input input-bordered w-full"
            value={formData.price_five}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
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
