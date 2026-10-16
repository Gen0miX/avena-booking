"use client";

import { useState } from "react";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
import { PricingPeriod, PricingPeriodInput } from "@/lib/pricingPeriods";
import PricingPeriodForm from "./PricingPeriodForm";
import PricingPeriodsList from "./PricingPeriodsList";
import { IoAddOutline } from "react-icons/io5";
import RateTable from "@/components/home/RateTable";
import { ApartmentSlug, getApartmentBySlug } from "@/config/apartments";

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
        <span className="loading loading-spinner loading-lg text-cta"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="alert alert-error">
        Erreur lors du chargement des périodes tarifaires
      </div>
    );
  }

  return (
    <>
      {/* Tarifs par défaut */}
      <section className="bg-surface rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-1">
          <h2 className="text-[17px] font-semibold mb-1.5">Tarifs saisonniers</h2>
          <p className="text-sm text-base-content/70">
            Appliqués automatiquement selon la date. Prix par nuit, ménage et
            taxes inclus.
          </p>
        </div>
        {apartment && <RateTable apartment={apartment} />}
      </section>

      {/* Périodes personnalisées */}
      <section className="bg-surface rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <h2 className="text-[17px] font-semibold mb-1.5">Périodes spéciales</h2>
            <p className="text-sm text-base-content/70">
              Prioritaires sur les tarifs saisonniers (Carnaval, événements…).
            </p>
          </div>
          <button
            type="button"
            className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
            onClick={handleCreate}
            disabled={isFormOpen}
          >
            <IoAddOutline size={18} aria-hidden="true" />
            Ajouter une période
          </button>
        </div>

        {isFormOpen && (
          <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
            <h3 className="font-semibold mb-3">
              {editingPeriod ? "Modifier la période" : "Nouvelle période"}
            </h3>
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
        )}

        <PricingPeriodsList
          periods={periods}
          onEdit={handleEdit}
          onDelete={handleDelete}
          apartmentSlug={apartmentSlug}
        />
      </section>
    </>
  );
}
