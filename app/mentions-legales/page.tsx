"use client";
import React from "react";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";

export default function MentionsLegales() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 mt-12 bg-base py-12 px-4 sm:px-6 lg:px-20">
        <div className="max-w-3xl mx-auto bg-base-200 border border-primary/40 shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Mentions Légales
          </h1>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Éditeur du site</h2>
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
              <br />
              Site :{" "}
              <a
                className="text-primary underline"
                href="https://www.jonas-pilloud.ch"
                target="_blank"
              >
                https://www.jonas-pilloud.ch
              </a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Hébergement</h2>
            <p>
              Ce site est hébergé par :<br />
              Vercel Inc.
              <br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
              <br />
              <a
                className="text-primary underline"
                href="https://vercel.com"
                target="_blank"
              >
                https://vercel.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              Propriété intellectuelle
            </h2>
            <p>
              L’ensemble des contenus de ce site (textes, images, logo) est
              protégé par le droit d’auteur. Toute reproduction ou utilisation
              non autorisée est interdite.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
