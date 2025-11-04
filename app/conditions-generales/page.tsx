"use client";
import React from "react";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";

export default function ConditionsGenerales() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen mt-12 bg-base py-12 px-4 sm:px-6 lg:px-20">
        <div className="max-w-3xl mx-auto bg-base-200 border border-primary/40 shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Conditions Générales de Réservation
          </h1>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">1. Objet</h2>
            <p>
              Les présentes conditions générales régissent les réservations de
              l’appartement de vacances
              <strong> Avena</strong>, situé à Saas-Fee.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">2. Réservation</h2>
            <p>
              La réservation s’effectue via le formulaire en ligne ou par
              e-mail. Elle est considérée comme ferme uniquement après réception
              du paiement intégral.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">3. Prix et paiement</h2>
            <p>
              Le prix indiqué comprend : le logement, le linge de lit, la taxe
              de séjour ainsi que le ménage de fin de séjour. Le paiement du
              montant total est exigé au moment de la réservation.
            </p>
            <p>Modes de paiement acceptés : virement bancaire et Twint.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">4. Annulation</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Annulation jusqu’à 30 jours avant l’arrivée : remboursement
                intégral.
              </li>
              <li>
                Annulation entre 30 et 14 jours avant l’arrivée : remboursement
                de 50 %.
              </li>
              <li>
                Annulation moins de 14 jours avant l’arrivée ou non-présentation
                : aucun remboursement.
              </li>
            </ul>
            <p className="mt-2">
              Pour effectuer une annulation, merci de nous contacter directement
              par e-mail ou par téléphone.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              5. Utilisation du logement
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Nombre maximum d’occupants : 5 personnes.</li>
              <li>Les fêtes et évènements sont interdits.</li>
              <li>Animaux : non autorisés.</li>
              <li>
                Horaires : check-in à partir de 16h00 ; check-out avant 11h00.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">6. Responsabilité</h2>
            <p>
              Le propriétaire décline toute responsabilité en cas de vol, perte
              ou dommage subi par les locataires ou leurs biens durant le
              séjour. Le locataire est responsable de tout dommage causé au
              logement, à son mobilier ou à ses équipements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              7. Loi applicable et juridiction
            </h2>
            <p>
              Les présentes conditions sont régies par le droit suisse. Le for
              juridique est fixé à Fribourg.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
