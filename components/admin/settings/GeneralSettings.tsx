"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { formatBlockedDate } from "@/lib/settings";
import { FaCalendarTimes, FaSave, FaTimes, FaEdit } from "react-icons/fa";

export default function GeneralSettings() {
  const { settings, isLoading, isError, updateSettings } = useSettings();
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
    <div className="space-y-6">
      {/* Limite des réservations */}
      <div className="card bg-base-200 border border-primary/20">
        <div className="card-body">
          <h3 className="card-title text-lg">
            <FaCalendarTimes className="text-warning" />
            Limite des réservations
          </h3>
          <p className="text-sm text-base-content/70 mb-4">
            Définissez une date limite pour les réservations. Les utilisateurs
            ne pourront pas réserver de dates après cette limite.
          </p>

          {success && (
            <div className="alert alert-success mb-4">
              Paramètres enregistrés avec succès
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4">{error}</div>
          )}

          {!isEditing ? (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">
                  Réservations possibles jusqu'au :
                </p>
                <p className="text-lg font-semibold">
                  {settings?.booking_blocked_after
                    ? formatBlockedDate(settings.booking_blocked_after)
                    : "Aucune limite"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="mr-2" />
                  Modifier
                </button>
                {settings?.booking_blocked_after && (
                  <button
                    className="btn btn-outline btn-error btn-sm"
                    onClick={handleRemoveBlock}
                    disabled={isSubmitting}
                  >
                    <FaTimes className="mr-2" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Date limite de réservation</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Les réservations après cette date seront bloquées
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Enregistrer
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
