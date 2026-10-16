"use client";

import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import Disponibility from "@/components/home/Disponibility";
import Gallery from "@/components/home/Gallery";
import ServiceBadges from "@/components/home/ServiceBadges";
import SectionTitle from "@/components/home/SectionTitle";
import Amenities from "@/components/home/Amenities";
import { GoogleMapsEmbed } from "@next/third-parties/google";
import { ApartmentConfig } from "@/config/apartments";

export default function ApartmentPageClient({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  return (
    <>
      <div className="sticky top-0 z-50">
        <NavBar />
      </div>

      <div className="bg-base-100 pt-5 sm:pt-10 pb-5">
        {!apartment.isContentComplete && (
          <div
            role="status"
            className="alert alert-warning xl:max-w-6xl xl:mx-auto mx-1 sm:mx-5 mb-3"
          >
            <span>
              Contenu en cours de préparation pour cet appartement — certaines
              informations ne sont pas encore disponibles.
            </span>
          </div>
        )}
        <section
          id="home"
          className="xl:max-w-6xl xl:mx-auto bg-base-200 rounded-box mx-1 p-2 border-2 border-primary/40 sm:p-5 sm:mx-5 self-center z-50 scroll-mt-[72px]"
        >
          <Gallery apartment={apartment}></Gallery>

          <div className="relative flex flex-col lg:max-w-1/2 pt-3">
            <SectionTitle>{apartment.name}</SectionTitle>
            <p className="text-lg sm:text-xl font-light">{apartment.address}</p>
          </div>
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="flex flex-col lg:max-w-1/2 pt-5 mr-auto">
              <ServiceBadges apartment={apartment} />
              <h3 className="text-lg sm:text-xl font-semibold mb-5">
                {apartment.description.tagline}
              </h3>
              <p className="text-justify text-sm sm:text-base mb-2 text-base-content/70">
                {apartment.description.intro}
              </p>
              <p className="mb-2 text-sm sm:text-base text-base-content/70">
                {apartment.description.capacityIntro}
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base pl-5 sm:pl-10 text-base-content/70 mb-10">
                {apartment.description.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <h3 className="text-lg sm:text-xl font-semibold mb-5">
                Équipements
              </h3>
              <Amenities apartment={apartment} />
              <h3 className="text-lg sm:text-xl font-semibold mb-5">
                Localisation
              </h3>
              <p className="text-justify text-sm sm:text-base mb-2 text-base-content/70">
                {apartment.description.locationIntro}
              </p>
              <p className="mb-2 text-sm sm:text-base text-base-content/70">
                En hiver, profitez de :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base pl-5 sm:pl-10 text-base-content/70 mb-3">
                {apartment.description.winterHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className="mb-2 text-sm sm:text-base text-base-content/70">
                En été :
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base pl-5 sm:pl-10 text-base-content/70 mb-3">
                {apartment.description.summerHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className="text-justify mb-5 text-sm sm:text-base text-base-content/70">
                {apartment.description.locationOutro}
              </p>
              <div className="border-2 border-primary/40 rounded-box overflow-hidden">
                <GoogleMapsEmbed
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                  height={300}
                  width="100%"
                  mode="place"
                  q={apartment.mapQuery}
                />
              </div>
            </div>

            <Disponibility apartment={apartment} />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
