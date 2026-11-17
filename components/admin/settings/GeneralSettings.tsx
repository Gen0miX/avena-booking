"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { formatBlockedDate } from "@/lib/settings";
import { ApartmentSlug } from "@/config/apartments";

interface GeneralSettingsProps {
  apartmentSlug: ApartmentSlug;
}

export default function GeneralSettings({
  apartmentSlug,
}: GeneralSettingsProps) {
  const { settings, isLoading, isError, updateSettings } =
    useSettings(apartmentSlug);
  const [isEditing, setIsEditing] = useState(false);
  const [blockDate, setBlockDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings?.booking_blocked_after) {
      setBlockDate(settings.booking_blocked_after);
    } else {
      setBlockDate("");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await updateSettings({
        apartment_id: apartmentSlug,
        booking_blocked_after: blockDate || null,
      });
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    if (settings?.booking_blocked_after) {
      setBlockDate(settings.booking_blocked_after);
    } else {
      setBlockDate("");
    }
  };

  const handleRemoveBlock = async () => {
    if (!confirm("Voulez-vous vraiment supprimer la limite de réservation ?")) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateSettings({
        apartment_id: apartmentSlug,
        booking_blocked_after: null,
      });
      setBlockDate("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    } finally {
      setIsSubmitting(false);
    }
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
        Erreur lors du chargement des paramètres
      </div>
    );
  }

  return (
    <section className="bg-surface rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-wrap gap-5 items-center justify-between">
        <div className="max-w-[520px]">
          <h2 className="text-[17px] font-semibold mb-1.5">Ouverture des réservations</h2>
          <p className="text-sm leading-relaxed text-base-content/70">
            Les voyageurs ne peuvent pas réserver de dates après cette limite.
            Pratique tant que les tarifs de la saison suivante ne sont pas fixés.
          </p>
        </div>
        {!isEditing && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="sm:text-right">
              <p className="text-[13px] text-base-content/65">Ouvertes jusqu&apos;au</p>
              <p className="font-semibold text-[17px]">
                {settings?.booking_blocked_after
                  ? formatBlockedDate(settings.booking_blocked_after)
                  : "Aucune limite"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn h-11 rounded-xl btn-outline border-base-300"
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </button>
              {settings?.booking_blocked_after && (
                <button
                  type="button"
                  className="btn h-11 rounded-xl btn-outline btn-error"
                  onClick={handleRemoveBlock}
                  disabled={isSubmitting}
                >
                  Retirer la limite
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {success && (
        <div role="status" className="alert alert-success">
          Paramètres enregistrés avec succès
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="flex flex-wrap items-end gap-3 border-t border-base-200 pt-4">
          <label className="flex flex-col gap-1.5 w-full max-w-xs">
            <span className="text-sm font-medium">Date limite de réservation</span>
            <input
              type="date"
              className="input w-full h-11 rounded-xl"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn h-11 rounded-xl btn-outline border-base-300"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="loading loading-spinner loading-sm" />}
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
