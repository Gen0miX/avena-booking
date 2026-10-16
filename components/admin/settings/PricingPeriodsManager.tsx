"use client";

import { useState } from "react";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
import { PricingPeriod, PricingPeriodInput } from "@/lib/pricingPeriods";
import PricingPeriodForm from "./PricingPeriodForm";
import PricingPeriodsList from "./PricingPeriodsList";
import { FaPlus, FaInfoCircle } from "react-icons/fa";
import { ApartmentSlug, getApartmentBySlug } from "@/config/apartments";

const SEASON_LABELS: Record<string, { name: string; dates: string }> = {
  basseSaison: { name: "Basse saison", dates: "Mai - Octobre" },
  novembre: { name: "Novembre", dates: "1 - 30 Novembre" },
  hiver: { name: "Hiver", dates: "1-17 Déc, 11 Jan - 30 Avr" },
  fetes: { name: "Fêtes", dates: "18 Déc - 10 Jan" },
};

const SEASON_ORDER = ["basseSaison", "novembre", "hiver", "fetes"] as const;

function formatTierLabel(
  tiers: { minAdults: number; price: number }[],
  index: number,
  capacity: number
): string {
  const tier = tiers[index];
  const next = tiers[index + 1];
  const rangeEnd = next ? next.minAdults - 1 : capacity;
  const peopleLabel =
    rangeEnd === tier.minAdults
      ? `${tier.minAdults} pers.`
      : `${tier.minAdults}-${rangeEnd} pers.`;
  return `${peopleLabel} : ${tier.price} CHF`;
}

interface PricingPeriodsManagerProps {
  apartmentSlug: ApartmentSlug;
}

export default function PricingPeriodsManager({
  apartmentSlug,
}: PricingPeriodsManagerProps) {
  const {
    periods,
    isLoading,
    isError,
    createPeriod,
    updatePeriod,
    deletePeriod,
  } = usePricingPeriods(apartmentSlug);
  const apartment = getApartmentBySlug(apartmentSlug)!;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PricingPeriod | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setEditingPeriod(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEdit = (period: PricingPeriod) => {
    setEditingPeriod(period);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette période tarifaire ?")) return;

    try {
      await deletePeriod(id);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  const handleSubmit = async (data: PricingPeriodInput) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingPeriod) {
        await updatePeriod(editingPeriod.id, data);
      } else {
        await createPeriod(data);
      }
      setIsFormOpen(false);
      setEditingPeriod(null);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingPeriod(null);
    setFormError(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        Erreur lors du chargement des périodes tarifaires
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarifs par défaut */}
      <div className="card bg-base-200 border border-primary/20">
        <div className="card-body">
          <h3 className="card-title text-lg">
            <FaInfoCircle className="text-info" />
            Tarifs par défaut (automatiques)
          </h3>
          <p className="text-sm text-base-content/70 mb-4">
            Ces tarifs s'appliquent automatiquement selon la période de l'année.
          </p>
          <div className="space-y-3">
            {SEASON_ORDER.map((seasonKey) => {
              const label = SEASON_LABELS[seasonKey];
              const tiers = apartment.defaultRates[seasonKey];
              return (
                <div
                  key={seasonKey}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-base-300 pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="sm:w-56 flex-shrink-0">
                    <span className="font-medium">{label.name}</span>{" "}
                    <span className="text-sm text-base-content/70">
                      ({label.dates})
                    </span>
                  </div>
                  <div className="text-sm text-base-content/80 flex flex-wrap gap-x-2">
                    {tiers.map((tier, index) => (
                      <span key={tier.minAdults}>
                        {formatTierLabel(tiers, index, apartment.capacity)}
                        {index < tiers.length - 1 && " /"}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Périodes personnalisées */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Périodes personnalisées</h3>
            <p className="text-sm text-base-content/70">
              Ces périodes prennent priorité sur les tarifs par défaut.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreate}
            disabled={isFormOpen}
          >
            <FaPlus className="mr-2" />
            Ajouter une période
          </button>
        </div>

        {isFormOpen && (
          <div className="card bg-base-200 border border-primary/40 shadow-lg">
            <div className="card-body">
              <h4 className="card-title">
                {editingPeriod ? "Modifier la période" : "Nouvelle période"}
              </h4>
              <PricingPeriodForm
                apartmentSlug={apartmentSlug}
                initialData={editingPeriod}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                error={formError}
                existingPeriods={periods}
              />
            </div>
          </div>
        )}

        <PricingPeriodsList
          periods={periods}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
