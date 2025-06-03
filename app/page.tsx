"use client";

import Hero from "@/components/Hero";
import Disponibility from "@/components/Disponibility";
import Gallery from "@/components/Gallery";
import ServiceBadges from "@/components/ServiceBadges";
import { GoogleMapsEmbed } from "@next/third-parties/google";

export default function Home() {
  return (
    <>
      <Hero></Hero>
      <div className="xl:mx-20 bg-base-200 rounded-box border-2 border-primary/20 p-5 m-5">
        <Gallery></Gallery>
        <div className="flex">
          <div className="flex flex-col max-w-1/2">
            <h2 className="font-heading text-5xl font-semibold">
              Appartement Avena
            </h2>
            <p className="mb-5 text-xl">Untere Dorfstrasse 41, 3906 Saas-Fee</p>
            <ServiceBadges />
            <h3 className="text-xl font-bold mb-5">
              Un séjour comme à la maison, à Saas-Fee
            </h3>
            <p className="text-justify mb-2 text-base-content/70">
              Vous cherchez une location d’appartement à Saas-Fee pour vos
              prochaines vacances en montagne ? Découvrez notre hébergement tout
              confort situé à Untere Dorfstrasse 41, en plein cœur de la station
              piétonne de Saas-Fee, dans les Alpes valaisannes.
            </p>
            <p className="mb-2 text-base-content/70">
              Cet appartement lumineux peut accueillir jusqu’à 6 personnes et
              dispose de :
            </p>
            <ul className="list-disc list-inside pl-10 text-base-content/70 mb-10">
              <li>Deux chambres spacieuses avec literie de qualité</li>
              <li>Un petit studio mis à dispostion pour 5 à 6 personnes</li>
              <li>Un salon chaleureux avec coin repas</li>
              <li>
                Une cuisine équipée (four, plaques, lave-vaisselle, machine à
                café)
              </li>
              <li>Une salle de bain (deux avec celle du studio)</li>
              <li>Wi-Fi gratuit, TV, linge de lit et serviettes inclus</li>
            </ul>
            <h3 className="text-xl font-bold mb-5">Localisation</h3>
            <GoogleMapsEmbed
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              height={300}
              width="100%"
              mode="place"
              q="Untere Dorfstrasse 41, 3906 Saas-Fee, Suisse"
            />
          </div>
          <Disponibility />
        </div>
      </div>
    </>
  );
}
