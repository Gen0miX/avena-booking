"use client";

import Hero from "@/components/Hero";
import Disponibility from "@/components/Disponibility";
import Gallery from "@/components/Gallery";
import ServiceBadges from "@/components/ServiceBadges";
import SectionTitle from "@/components/SectionTitle";
import Amenities from "@/components/Amenities";
import { GoogleMapsEmbed } from "@next/third-parties/google";

export default function Home() {
  return (
    <>
      <Hero></Hero>

      <section className="xl:max-w-6xl xl:mx-auto bg-base-200 rounded-box m-1 p-2 border-2 border-primary/40 sm:p-5 sm:m-5 self-center z-50">
        <Gallery></Gallery>

        <div className="relative flex flex-col lg:max-w-1/2 pt-3">
          <SectionTitle>Appartement Avena</SectionTitle>
          <p className="text-lg sm:text-xl font-light">
            Untere Dorfstrasse 39, 3906 Saas-Fee
          </p>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-20">
          <div className="flex flex-col lg:max-w-1/2 pt-5">
            <ServiceBadges />
            <h3 className="text-lg sm:text-xl font-semibold mb-5">
              Un séjour comme à la maison, à Saas-Fee
            </h3>
            <p className="text-justify text-sm sm:text-base mb-2 text-base-content/70">
              Vous cherchez une location d’appartement à Saas-Fee pour vos
              prochaines vacances en montagne ? Découvrez notre hébergement tout
              confort situé à Untere Dorfstrasse 39, en plein cœur de la station
              piétonne de Saas-Fee, dans les Alpes valaisannes.
            </p>
            <p className="mb-2 text-sm sm:text-base text-base-content/70">
              Cet appartement lumineux peut accueillir jusqu’à 5 personnes et
              dispose de :
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base pl-5 sm:pl-10 text-base-content/70 mb-10">
              <li>Deux chambres spacieuses avec literie de qualité</li>
              <li>Un petit studio mis à dispostion pour la 5ème personne</li>
              <li>Un salon chaleureux avec coin repas</li>
              <li>
                Une cuisine équipée (four, plaques, lave-vaisselle, machine à
                café)
              </li>
              <li>Une salle de bain (deux avec celle du studio)</li>
              <li>Wi-Fi gratuit, TV, linge de lit et serviettes inclus</li>
            </ul>
            <h3 className="text-lg sm:text-xl font-semibold mb-5">
              Équipements
            </h3>
            <Amenities />
            <h3 className="text-lg sm:text-xl font-semibold mb-5">
              Localisation
            </h3>
            <p className="text-justify text-sm sm:text-base mb-2 text-base-content/70">
              Située à 1800 mètres d’altitude, Saas-Fee est une destination de
              choix pour un séjour en montagne en toute saison.
            </p>
            <p className="mb-2 text-sm sm:text-base text-base-content/70">
              En hiver, profitez de :
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base pl-5 sm:pl-10 text-base-content/70 mb-3">
              <li>Plus de 100 km de pistes de ski</li>
              <li>Snowpark, ski de fond, randonnées en raquettes</li>
              <li>
                Patinoire, pistes de luge, paysages enneigés à couper le souffle
              </li>
            </ul>
            <p className="mb-2 text-sm sm:text-base text-base-content/70">
              En été :
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base pl-5 sm:pl-10 text-base-content/70 mb-3">
              <li>Randonnées panoramiques dans les Alpes suisses</li>
              <li>Activités en plein air : VTT, via ferrata, tyrolienne</li>
              <li>Découverte du patrimoine local et gastronomie valaisanne</li>
            </ul>
            <p className="mb-5 text-sm sm:text-base text-base-content/70">
              Notre appartement bénéficie d’un emplacement central idéal, à
              seulement 5 minutes à pied de l’arrêt de bus et 10 minutes du
              parking principal. Vous pouvez ainsi profiter pleinement de tout
              ce que Saas-Fee a à offrir, sans contrainte de transport.
            </p>
            <div className="border-2 border-primary/40 rounded-box overflow-hidden">
              <GoogleMapsEmbed
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                height={300}
                width="100%"
                mode="place"
                q="Untere Dorfstrasse 39, 3906 Saas-Fee, Suisse"
              />
            </div>
          </div>

          <Disponibility />
        </div>
      </section>
    </>
  );
}
