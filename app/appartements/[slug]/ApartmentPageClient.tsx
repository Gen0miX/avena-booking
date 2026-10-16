"use client";

import Link from "next/link";
import { IoCheckmark, IoLocationOutline } from "react-icons/io5";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import Disponibility from "@/components/home/Disponibility";
import Gallery from "@/components/home/Gallery";
import ServiceBadges from "@/components/home/ServiceBadges";
import Amenities from "@/components/home/Amenities";
import RateTable from "@/components/home/RateTable";
import CustomDayPicker from "@/components/CustomDayPicker";
import { GoogleMapsEmbed } from "@next/third-parties/google";
import { ApartmentConfig, getStartingPrice } from "@/config/apartments";

const h2 = "font-heading font-semibold text-[26px] sm:text-[28px] mb-2";
const muted = "text-base leading-relaxed text-base-content/75";

export default function ApartmentPageClient({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  const { description } = apartment;

  return (
    <div className="bg-base-100 text-base-content">
      <div className="sticky top-0 z-50">
        <NavBar />
      </div>

      <main className="max-w-[1328px] mx-auto px-4 sm:px-8 lg:px-14 pt-5 sm:pt-6 pb-16 lg:pb-24">
        <nav aria-label="Fil d'Ariane" className="mb-4 sm:mb-5 text-sm text-base-content/70">
          <Link href="/#appartements" className="link link-hover">
            Appartements
          </Link>{" "}
          <span aria-hidden="true">/</span> {apartment.name}
        </nav>

        {!apartment.isContentComplete && (
          <div role="status" className="alert alert-warning mb-5">
            <span>
              Contenu en cours de préparation pour cet appartement — certaines
              informations ne sont pas encore disponibles.
            </span>
          </div>
        )}

        <div className="mb-5 sm:mb-6">
          <h1 className="font-heading font-semibold text-[40px] sm:text-5xl lg:text-[64px] leading-[1.05] mb-2">
            {apartment.name}
          </h1>
          <p className="flex items-center gap-2 text-base sm:text-[17px] text-base-content/75">
            <IoLocationOutline className="text-cta shrink-0" size={18} aria-hidden="true" />
            {apartment.address}
          </p>
        </div>

        <div className="mb-10 sm:mb-14">
          <Gallery apartment={apartment} />
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          <div className="flex-1 min-w-0 w-full flex flex-col gap-12 sm:gap-14">
            <ServiceBadges apartment={apartment} />

            {apartment.isContentComplete && (
              <section>
                <h2 className="font-heading font-semibold text-[28px] sm:text-[34px] leading-tight mb-4">
                  {description.tagline}
                </h2>
                <p className={`${muted} mb-4`}>{description.intro}</p>
                <p className={`${muted} mb-4`}>{description.capacityIntro}</p>
                <ul className="flex flex-col gap-3">
                  {description.features.map((feature) => (
                    <li key={feature} className="flex gap-3 leading-relaxed">
                      <IoCheckmark
                        size={20}
                        className="text-cta shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className={`${h2} mb-3`}>Équipements</h2>
              <Amenities apartment={apartment} />
            </section>

            <section>
              <h2 className={h2}>Tarifs par nuit</h2>
              <p className="text-[15px] text-base-content/75 mb-5">
                Selon la saison et le nombre d&apos;adultes. Ménage et taxes
                inclus, séjour de {apartment.minNights} nuits minimum. Des
                tarifs spéciaux peuvent s&apos;appliquer à certaines périodes.
              </p>
              <RateTable apartment={apartment} />
            </section>

            <section>
              <h2 className={h2}>Disponibilités</h2>
              <p className="text-[15px] text-base-content/75 mb-5">
                Les dates barrées sont déjà réservées.
              </p>
              <div className="bg-surface rounded-2xl p-3 sm:p-5 overflow-x-auto flex justify-center">
                <CustomDayPicker mode="readOnly" apartmentId={apartment.slug} />
              </div>
            </section>

            <section>
              <h2 className={h2}>Localisation</h2>
              {apartment.isContentComplete && (
                <p className={`${muted} mb-5`}>{description.locationIntro}</p>
              )}
              <div className="rounded-2xl overflow-hidden mb-5">
                <GoogleMapsEmbed
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                  height={320}
                  width="100%"
                  mode="place"
                  q={apartment.mapQuery}
                />
              </div>
              {(description.winterHighlights.length > 0 ||
                description.summerHighlights.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {description.winterHighlights.length > 0 && (
                    <div className="bg-surface rounded-2xl p-5">
                      <h3 className="font-semibold text-accent mb-2.5">En hiver</h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-base-content/75">
                        {description.winterHighlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {description.summerHighlights.length > 0 && (
                    <div className="bg-surface rounded-2xl p-5">
                      <h3 className="font-semibold text-secondary mb-2.5">En été</h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-base-content/75">
                        {description.summerHighlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {apartment.isContentComplete && (
                <p className={muted}>{description.locationOutro}</p>
              )}
            </section>
          </div>

          <aside className="w-full lg:w-[380px] lg:shrink-0 lg:sticky lg:top-24">
            <Disponibility apartment={apartment} />
          </aside>
        </div>
      </main>

      {/* Barre de réservation mobile : la carte est en bas de page sur petit écran */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-base-300 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-8px_24px_rgba(43,50,64,0.08)]">
        <p className="text-sm text-base-content/75">
          <span className="font-heading text-xl font-semibold text-base-content">
            CHF {getStartingPrice(apartment)}
          </span>{" "}
          dès / nuit
        </p>
        <a
          href="#reserver"
          className="btn rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90 px-6"
        >
          Réserver
        </a>
      </div>

      <Footer />
      <div className="h-[72px] lg:hidden" aria-hidden="true" />
    </div>
  );
}
