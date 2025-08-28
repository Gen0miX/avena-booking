"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useBooking from "@/hooks/useBooking";
import StatusBadge from "@/components/StatusBadge";
import { FaLongArrowAltRight } from "react-icons/fa";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function BookingDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { booking, loading, error } = useBooking(id);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>(null);

  const handleEdit = () => {
    setForm({
      fname: booking.fname,
      lname: booking.lname,
      mail: booking.mail,
      phone: booking.phone,
      no_adults: booking.no_adults,
      no_childs: booking.no_childs,
      is_cleaning: booking.is_cleaning,
    });
    setIsEditing(true);
  };

  // Gérer la modification des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gérer la sauvegarde (à adapter selon ton API)
  const handleSave = async () => {
    // Appelle ici ton endpoint de mise à jour
    // await updateBooking(id, form);
    setIsEditing(false);
    // Optionnel: rafraîchir les données
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;
  if (!booking) return <p>Aucune réservation trouvée.</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Détails réservation #{booking.id}</h1>

      {!isEditing ? (
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Nom :</span> {booking.fname}{" "}
            {booking.lname}
          </p>
          <p>
            <span className="font-semibold">Email :</span> {booking.mail}
          </p>
          <p>
            <span className="font-semibold">Téléphone :</span> {booking.phone}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold">Dates :</span>{" "}
            {format(booking.arrival_date, "dd MMM yyyy", { locale: fr })}
            <FaLongArrowAltRight />
            {format(booking.departure_date, "dd MMM yyyy", {
              locale: fr,
            })}
          </p>
          <p>
            <span className="font-semibold">Personnes :</span>{" "}
            {booking.no_adults} adultes / {booking.no_childs ?? 0} enfants
          </p>
          <p>
            <span className="font-semibold">Ménage :</span>{" "}
            {booking.is_cleaning ? "Oui" : "Non"}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold">Total :</span>{" "}
            {booking.price.toLocaleString("ch-ch", {
              style: "currency",
              currency: "CHF",
            })}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold">Paiement :</span>{" "}
            {booking.is_paid ? "Payé" : "Non payé"}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold">Statut :</span>{" "}
            <StatusBadge status={booking.status.name} />
          </p>
          <div className="mt-6">
            <button className="btn btn-primary" onClick={handleEdit}>
              Modifier la réservation
            </button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label className="font-semibold">Nom :</label>
            <input
              className="input input-bordered ml-2"
              name="fname"
              value={form.fname}
              onChange={handleChange}
            />
            <input
              className="input input-bordered ml-2"
              name="lname"
              value={form.lname}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="font-semibold">Email :</label>
            <input
              className="input input-bordered ml-2"
              name="mail"
              value={form.mail}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="font-semibold">Téléphone :</label>
            <input
              className="input input-bordered ml-2"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="font-semibold">Adultes :</label>
            <input
              type="number"
              className="input input-bordered ml-2 w-20"
              name="no_adults"
              value={form.no_adults}
              onChange={handleChange}
            />
            <label className="font-semibold ml-4">Enfants :</label>
            <input
              type="number"
              className="input input-bordered ml-2 w-20"
              name="no_childs"
              value={form.no_childs}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="font-semibold">Ménage :</label>
            <input
              type="checkbox"
              className="checkbox ml-2"
              name="is_cleaning"
              checked={form.is_cleaning}
              onChange={handleChange}
            />
          </div>
          {/* Ajoute d'autres champs si besoin */}
          <div className="mt-6 flex gap-2">
            <button className="btn btn-success" type="submit">
              Sauvegarder
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
