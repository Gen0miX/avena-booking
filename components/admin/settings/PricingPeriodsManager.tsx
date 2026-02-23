"use client";

import { useState } from "react";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
import {
  PricingPeriod,
  PricingPeriodInput,
  DEFAULT_RATES,
} from "@/lib/pricingPeriods";
import PricingPeriodForm from "./PricingPeriodForm";
import PricingPeriodsList from "./PricingPeriodsList";
import { FaPlus, FaInfoCircle } from "react-icons/fa";

export default function PricingPeriodsManager() {
  const {
    periods,
    isLoading,
    isError,
    createPeriod,
    updatePeriod,
    deletePeriod,
  } = usePricingPeriods();
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
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Dates</th>
                  <th className="text-right">≤4 adultes</th>
                  <th className="text-right">5 adultes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">{DEFAULT_RATES.basseSaison.name}</td>
                  <td className="text-base-content/70">Mai - Octobre</td>
                  <td className="text-right">{DEFAULT_RATES.basseSaison.price_standard} CHF</td>
                  <td className="text-right">{DEFAULT_RATES.basseSaison.price_five} CHF</td>
                </tr>
                <tr>
                  <td className="font-medium">{DEFAULT_RATES.novembre.name}</td>
                  <td className="text-base-content/70">1 - 30 Novembre</td>
                  <td className="text-right">{DEFAULT_RATES.novembre.price_standard} CHF</td>
                  <td className="text-right">{DEFAULT_RATES.novembre.price_five} CHF</td>
                </tr>
                <tr>
                  <td className="font-medium">{DEFAULT_RATES.hiver.name}</td>
                  <td className="text-base-content/70">1-17 Déc, 11 Jan - 30 Avr</td>
                  <td className="text-right">{DEFAULT_RATES.hiver.price_standard} CHF</td>
                  <td className="text-right">{DEFAULT_RATES.hiver.price_five} CHF</td>
                </tr>
                <tr>
                  <td className="font-medium">{DEFAULT_RATES.fetes.name}</td>
                  <td className="text-base-content/70">18 Déc - 10 Jan</td>
                  <td className="text-right">{DEFAULT_RATES.fetes.price_standard} CHF</td>
                  <td className="text-right">{DEFAULT_RATES.fetes.price_five} CHF</td>
                </tr>
              </tbody>
            </table>
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
