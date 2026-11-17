"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { IoAddOutline, IoTrashOutline } from "react-icons/io5";
import {
  APARTMENT_LIST,
  ApartmentSlug,
  getApartmentBySlug,
} from "@/config/apartments";
import { parseMonthFromCode } from "@/lib/promo";

interface PromoCode {
  id: number;
  created_at: string;
  name: string;
  percentage: number;
  active: boolean;
  apartment_id: string;
  valid_from: string | null;
  valid_to: string | null;
}

const MONTH_LABELS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

const todayIso = () => {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth() + 1, t.getDate());
};

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Saisons de la grille tarifaire : hiver du 1er décembre au 30 avril, été du
// 1er mai au 30 novembre. On propose la saison en cours, sinon la prochaine.
const seasonPresets = () => {
  const t = new Date();
  const y = t.getFullYear();
  const m = t.getMonth(); // 0-11
  const winterStart = m >= 4 ? y : y - 1;
  const summerYear = m <= 10 ? y : y + 1;
  return [
    {
      label: `Hiver ${winterStart}–${String(winterStart + 1).slice(2)}`,
      from: iso(winterStart, 12, 1),
      to: iso(winterStart + 1, 4, 30),
    },
    {
      label: `Été ${summerYear}`,
      from: iso(summerYear, 5, 1),
      to: iso(summerYear, 11, 30),
    },
  ];
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erreur de chargement");
  }
  return res.json();
};

/** Description de la validité, ancien format (mois dans le préfixe) compris. */
const validityLabel = (promo: PromoCode) => {
  if (promo.valid_from && promo.valid_to) {
    return `nuits du ${formatDate(promo.valid_from)} au ${formatDate(promo.valid_to)}`;
  }
  const idx = parseMonthFromCode(promo.name);
  return idx === null ? "validité inconnue" : `séjours en ${MONTH_LABELS[idx]} (ancien format)`;
};

const isExpired = (promo: PromoCode) =>
  Boolean(promo.valid_to && promo.valid_to < todayIso());

export default function PromoCodesManager({
  apartment,
}: {
  apartment: ApartmentSlug | "all";
}) {
  const { data, error, isLoading, mutate } = useSWR<PromoCode[]>(
    `/api/promo?apartment=${apartment}`,
    fetcher,
  );

  const presets = seasonPresets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [active, setActive] = useState(true);
  const [target, setTarget] = useState<ApartmentSlug | "all">(apartment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => setTarget(apartment), [apartment]);

  const cleanName = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);

  const resetForm = () => {
    setName("");
    setValidFrom("");
    setValidTo("");
    setPercentage(10);
    setActive(true);
    setTarget(apartment);
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (name.length < 4) {
      setFormError("Le code doit contenir au moins 4 lettres ou chiffres.");
      return;
    }
    if (!validFrom || !validTo) {
      setFormError("Indiquez la période de validité du code.");
      return;
    }
    if (validFrom > validTo) {
      setFormError("La fin de la période doit être après son début.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          percentage,
          active,
          valid_from: validFrom,
          valid_to: validTo,
          apartments: target === "all" ? APARTMENT_LIST.map((a) => a.slug) : [target],
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Erreur lors de la création du code");
      await mutate();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (promo: PromoCode) => {
    setBusyId(promo.id);
    setListError(null);
    try {
      const res = await fetch(`/api/promo/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !promo.active }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur lors de la mise à jour");
      }
      await mutate();
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    const where = getApartmentBySlug(promo.apartment_id)?.name ?? promo.apartment_id;
    if (!confirm(`Supprimer le code ${promo.name} (${where}) ?`)) return;
    setBusyId(promo.id);
    setListError(null);
    try {
      const res = await fetch(`/api/promo/${promo.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur lors de la suppression");
      }
      await mutate();
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBusyId(null);
    }
  };

  const targetOptions: { value: ApartmentSlug | "all"; label: string }[] = [
    { value: "all", label: "Les deux appartements" },
    ...APARTMENT_LIST.map((a) => ({ value: a.slug, label: a.name })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-surface rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="max-w-[560px]">
            <h2 className="text-[17px] font-semibold mb-1.5">Codes promo</h2>
            <p className="text-sm leading-relaxed text-base-content/70">
              Chaque code est valable sur une période : il s&apos;applique aux
              réservations dont toutes les nuits tombent entre ces deux dates.
            </p>
          </div>
          {!isFormOpen && (
            <button
              type="button"
              className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
            >
              <IoAddOutline size={18} aria-hidden="true" />
              Nouveau code
            </button>
          )}
        </div>

        {isFormOpen && (
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5 flex flex-col gap-4"
          >
            <h3 className="font-semibold">Nouveau code</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Code</span>
                <input
                  type="text"
                  className="input w-full h-11 rounded-xl bg-surface uppercase tracking-wide"
                  value={name}
                  onChange={(e) => setName(cleanName(e.target.value))}
                  placeholder="HIVER10"
                  aria-describedby="promo-code-preview"
                  autoComplete="off"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Première nuit</span>
                <input
                  type="date"
                  className="input w-full h-11 rounded-xl bg-surface"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Dernière nuit</span>
                <input
                  type="date"
                  className="input w-full h-11 rounded-xl bg-surface"
                  value={validTo}
                  min={validFrom || undefined}
                  onChange={(e) => setValidTo(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Réduction</span>
                <div className="input w-full h-11 rounded-xl bg-surface">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    required
                  />
                  <span className="text-base-content/60">%</span>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Valable pour</span>
                <select
                  className="select w-full h-11 rounded-xl bg-surface"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as ApartmentSlug | "all")}
                >
                  {targetOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-base-content/70">Période rapide :</span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={`btn btn-sm h-9 rounded-lg ${
                    validFrom === p.from && validTo === p.to
                      ? "border-0 bg-cta text-cta-content hover:bg-cta/90"
                      : "btn-outline border-base-300"
                  }`}
                  onClick={() => {
                    setValidFrom(p.from);
                    setValidTo(p.to);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm cursor-pointer w-fit">
              <input
                type="checkbox"
                className="toggle toggle-sm checked:bg-cta checked:border-cta"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Actif dès maintenant
            </label>
            <p id="promo-code-preview" className="text-sm text-base-content/75">
              Code à communiquer :{" "}
              <span className="font-semibold tracking-wide">{name || "—"}</span> · −{percentage || 0} %
              {validFrom && validTo
                ? ` sur les nuits du ${formatDate(validFrom)} au ${formatDate(validTo)}`
                : ""}
            </p>
            {formError && (
              <div role="alert" className="alert alert-error py-3 text-sm">
                {formError}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn h-11 rounded-xl btn-outline border-base-300"
                onClick={() => {
                  setIsFormOpen(false);
                  setFormError(null);
                }}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn h-11 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="loading loading-spinner loading-sm" />}
                Créer le code
              </button>
            </div>
          </form>
        )}

        {listError && (
          <div role="alert" className="alert alert-error py-3 text-sm">
            {listError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg text-cta" />
          </div>
        ) : error ? (
          <div role="alert" className="alert alert-error">
            {error.message}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="rounded-xl border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/65">
            Aucun code promo pour le moment.
          </p>
        ) : (
          <ul className="border border-base-200 rounded-xl divide-y divide-base-200">
            {data.map((promo) => (
              <li
                key={promo.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3.5"
              >
                <div className="flex-1 basis-48 min-w-0">
                  <p className="font-semibold tracking-wide flex items-center gap-2">
                    {promo.name}
                    {isExpired(promo) && (
                      <span className="badge badge-sm border-0 bg-base-200 text-base-content/70 font-medium tracking-normal">
                        Expiré
                      </span>
                    )}
                  </p>
                  <p className="text-[13px] text-base-content/65">
                    {getApartmentBySlug(promo.apartment_id)?.name ?? promo.apartment_id} ·{" "}
                    {validityLabel(promo)}
                  </p>
                </div>
                <span className="font-heading text-xl font-semibold tabular-nums">
                  −{promo.percentage} %
                </span>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm checked:bg-cta checked:border-cta"
                    checked={promo.active}
                    disabled={busyId === promo.id}
                    onChange={() => handleToggle(promo)}
                    aria-label={`${promo.active ? "Désactiver" : "Activer"} ${promo.name}`}
                  />
                  <span className={promo.active ? "" : "text-base-content/60"}>
                    {promo.active ? "Actif" : "Inactif"}
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn-square h-10 w-10 rounded-xl btn-outline btn-error"
                  onClick={() => handleDelete(promo)}
                  disabled={busyId === promo.id}
                  aria-label={`Supprimer ${promo.name}`}
                >
                  <IoTrashOutline size={17} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
