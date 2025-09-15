"use client";
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function PolitiqueConfidentialite() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen mt-12 bg-base py-12 px-4 sm:px-6 lg:px-20">
        <div className="max-w-3xl mx-auto bg-base-200 border border-primary/40 shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Politique de Confidentialité
          </h1>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>
              La protection de vos données personnelles est une priorité. La
              présente politique de confidentialité explique quelles données
              nous collectons lors de l’utilisation de notre site, comment elles
              sont traitées et quels sont vos droits.
              <br />
              Ce site est soumis à la loi fédérale sur la protection des données
              (nLPD) et, pour les utilisateurs européens, au Règlement général
              sur la protection des données (RGPD).
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              2. Responsable du traitement
            </h2>
            <p>
              Nom : Jonas Pilloud
              <br />
              Adresse : Av. de la Gare 8, 1890 St-Maurice
              <br />
              E-mail :{" "}
              <a
                className="text-primary underline"
                href="mailto:contact@jonas-pilloud.ch"
              >
                contact@jonas-pilloud.ch
              </a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              3. Données collectées
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Données de réservation : nom, prénom, adresse e-mail, téléphone,
                dates de séjour, informations de paiement.
              </li>
              <li>
                Données techniques : adresse IP, type de navigateur, pages
                consultées (via outils d’analyse).
              </li>
              <li>
                Données fournies volontairement par l’utilisateur (ex.
                formulaire de contact).
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              4. Finalité du traitement
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Gérer et confirmer vos réservations.</li>
              <li>
                Communiquer avec vous avant, pendant et après votre séjour.
              </li>
              <li>
                Respecter nos obligations légales (facturation, comptabilité).
              </li>
              <li>Garantir la sécurité du site (via Google reCAPTCHA).</li>
              <li>Améliorer le site et son contenu (via outils d’analyse).</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              5. Partage des données
            </h2>
            <p>
              Vos données ne sont jamais revendues. Elles peuvent être
              transmises uniquement à des tiers nécessaires :
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Prestataires de paiement (banques, Twint, etc.) pour traiter vos
                paiements.
              </li>
              <li>
                Hébergeur du site (Vercel Inc.) pour l’exploitation technique.
              </li>
              <li>
                Google (pour reCAPTCHA et Maps) si vous utilisez ces services
                intégrés.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              6. Durée de conservation
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Données de réservation : conservées pendant 5 ans à des fins
                légales et comptables.
              </li>
              <li>
                Données techniques (logs, analytics) : conservées pour une durée
                limitée, généralement moins de 12 mois.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              7. Cookies et services tiers
            </h2>
            <p>
              Ce site utilise des cookies et des services tiers pour garantir
              son bon fonctionnement et améliorer l’expérience utilisateur :
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Cookies essentiels :</strong> <br /> nécessaires au
                fonctionnement du site (session, sécurité). Ils ne peuvent pas
                être désactivés.
              </li>
              <li>
                <strong>Google reCAPTCHA :</strong> <br /> protège les
                formulaires contre les abus et les spams. Politique de Google :{" "}
                <a
                  className="text-primary underline"
                  href="https://policies.google.com/privacy"
                  target="_blank"
                >
                  https://policies.google.com/privacy
                </a>
              </li>
              <li>
                <strong>Google Maps :</strong> <br /> permet d’afficher la
                localisation de l’appartement. Politique de Google :{" "}
                <a
                  className="text-primary underline"
                  href="https://policies.google.com/privacy"
                  target="_blank"
                >
                  https://policies.google.com/privacy
                </a>
              </li>
              <li>
                <strong>Vercel Analytics :</strong>
                <br /> mesure l’audience du site de manière anonyme. Politique :{" "}
                <a
                  className="text-primary underline"
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                >
                  https://vercel.com/legal/privacy-policy
                </a>
              </li>
              <li>
                <strong>Gestion des cookies :</strong> <br /> vous pouvez
                configurer votre navigateur pour bloquer ou supprimer les
                cookies, ce qui peut limiter certaines fonctionnalités.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">8. Vos droits</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Accès, rectification ou suppression.</li>
              <li>Limitation ou opposition au traitement.</li>
              <li>Portabilité des données (dans certains cas).</li>
            </ul>
            <p>
              Pour exercer vos droits, contactez :{" "}
              <a
                className="text-primary underline"
                href="mailto:contact@jonas-pilloud.ch"
              >
                contact@jonas-pilloud.ch
              </a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              9. Sécurité des données
            </h2>
            <p>
              Nous mettons en place des mesures techniques et organisationnelles
              appropriées pour protéger vos données contre tout accès non
              autorisé, perte ou divulgation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              10. Modification de la politique
            </h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de
              confidentialité à tout moment. La version en vigueur est celle
              publiée sur ce site.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
