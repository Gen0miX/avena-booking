"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  IoLocationOutline,
  IoBedOutline,
  IoCalendarOutline,
  IoCardOutline,
  IoSnowOutline,
  IoSunnyOutline,
  IoImageOutline,
} from "react-icons/io5";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import HeroBookingBar from "@/components/home/HeroBookingBar";
import { useBooking } from "@/context/BookingContext";
import {
  APARTMENT_LIST,
  ApartmentConfig,
  getStartingPrice,
} from "@/config/apartments";

const eyebrow =
  "mb-3 text-xs sm:text-[13px] tracking-[0.22em] uppercase font-semibold text-cta";
const sectionTitle =
  "font-heading font-semibold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.1]";
const container = "max-w-[1328px] mx-auto px-4 sm:px-8 lg:px-14";

function ApartmentCard({ apartment }: { apartment: ApartmentConfig }) {
  const { apartmentSlug, setApartmentSlug, setRange } = useBooking();
  const cover = apartment.gallery[0];

  const chips = [
    `Jusqu'à ${apartment.capacity} pers.`,
    apartment.bedrooms !== null &&
      `${apartment.bedrooms} chambre${apartment.bedrooms > 1 ? "s" : ""}`,
    apartment.bathrooms !== null &&
      `${apartment.bathrooms} salle${apartment.bathrooms > 1 ? "s" : ""} de bain`,
    `Min. ${apartment.minNights} nuits`,
  ].filter(Boolean) as string[];

  const selectApartment = () => {
    if (apartmentSlug !== apartment.slug) {
      setApartmentSlug(apartment.slug);
      setRange(undefined);
    }
  };

  return (
    <article className="flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm">
      <Link
        href={`/appartements/${apartment.slug}`}
        className="relative block aspect-[4/3] bg-base-300"
        tabIndex={-1}
        aria-hidden="true"
      >
        {cover ? (
          <Image
            src={cover.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cta">
            <IoImageOutline size={40} />
            <span className="text-[15px] font-medium">Photos à venir</span>
          </span>
        )}
        <span className="absolute top-4 left-4 bg-surface/95 text-base-content text-[13px] font-semibold px-3 py-2 rounded-full">
          Dès CHF {getStartingPrice(apartment)} / nuit
        </span>
      </Link>
      <div className="p-5 sm:p-7 flex flex-col gap-5 flex-1">
        <div>
          <h3 className="font-heading text-[28px] sm:text-[32px] font-semibold mb-1.5">
            {apartment.name}
          </h3>
          <p className="text-base leading-relaxed text-base-content/75">
            {apartment.isContentComplete
              ? apartment.description.tagline
              : "Description à venir."}
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li
              key={chip}
              className="text-sm px-3 py-2 rounded-lg bg-base-200 text-base-content/85"
            >
              {chip}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 sm:flex gap-3 mt-auto">
          <Link
            href={`/booking?apartment=${apartment.slug}`}
            onClick={selectApartment}
            className="btn rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90 px-5"
          >
            Réserver
          </Link>
          <Link
            href={`/appartements/${apartment.slug}`}
            className="btn btn-outline rounded-xl border-base-300 px-5"
          >
            Découvrir
          </Link>
        </div>
      </div>
    </article>
  );
}

const INFOS = [
  {
    icon: IoLocationOutline,
    title: "Emplacement central",
    text: "5 min à pied du bus, 10 min du parking principal.",
  },
  {
    icon: IoBedOutline,
    title: "Linge inclus",
    text: "Draps et serviettes fournis, Wi-Fi gratuit.",
  },
  {
    icon: IoCalendarOutline,
    title: "Séjour de 2 nuits min.",
    text: "Tarifs selon la saison et le nombre de voyageurs.",
  },
  {
    icon: IoCardOutline,
    title: "Paiement simple",
    text: "Facture QR envoyée par e-mail après confirmation.",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [showNavBar, setShowNavBar] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowNavBar(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-base-100 text-base-content">
      <AnimatePresence mode="wait">
        {showNavBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 inset-x-0 z-50"
          >
            <NavBar />
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={heroRef}>
        <Hero />
      </div>
      <HeroBookingBar />

      <section
        id="appartements"
        className={`${container} pt-20 sm:pt-28 pb-16 sm:pb-24 scroll-mt-[72px]`}
      >
        <div className="flex flex-wrap justify-between items-end gap-6 mb-10 sm:mb-12">
          <div className="max-w-[640px]">
            <p className={eyebrow}>Nos appartements</p>
            <h2 className={sectionTitle}>
              Le même immeuble, deux façons de séjourner
            </h2>
          </div>
          <p className="max-w-[400px] text-base sm:text-[17px] leading-relaxed text-base-content/75">
            Untere Dorfstrasse 39, à 5 minutes à pied de l&apos;arrêt de bus et
            10 minutes du parking principal.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {APARTMENT_LIST.map((apartment) => (
            <ApartmentCard key={apartment.slug} apartment={apartment} />
          ))}
        </div>
      </section>

      <section id="saas-fee" className="bg-base-200 scroll-mt-[72px]">
        <div
          className={`${container} py-14 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center`}
        >
          <div className="relative aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="/images/hero2.webp"
              alt="Vue sur Saas-Fee"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <p className={eyebrow}>Saas-Fee, à 1800 m</p>
              <h2 className={`${sectionTitle} mb-4`}>
                Une station à vivre en toute saison
              </h2>
              <p className="text-base sm:text-[17px] leading-relaxed text-base-content/75">
                Village sans voitures entouré de sommets de plus de 4000 m, au
                cœur des Alpes valaisannes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-3.5 text-accent">
                  <IoSnowOutline size={22} aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-base-content">
                    Hiver
                  </h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-[15px] leading-normal text-base-content/75">
                  <li>Plus de 100 km de pistes</li>
                  <li>Snowpark, ski de fond, raquettes</li>
                  <li>Patinoire et pistes de luge</li>
                </ul>
              </div>
              <div className="bg-surface rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-3.5 text-secondary">
                  <IoSunnyOutline size={22} aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-base-content">
                    Été
                  </h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-[15px] leading-normal text-base-content/75">
                  <li>Randonnées panoramiques</li>
                  <li>VTT, via ferrata, tyrolienne</li>
                  <li>Patrimoine et gastronomie valaisanne</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="infos"
        className={`${container} py-14 sm:py-24 scroll-mt-[72px]`}
      >
        <h2 className="font-heading font-semibold text-[28px] sm:text-[40px] mb-8 sm:mb-10">
          Bon à savoir
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 sm:gap-y-8">
          {INFOS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex sm:flex-col gap-3 sm:gap-2.5 pt-4 sm:pt-5 border-t border-base-300"
            >
              <Icon
                size={24}
                className="text-cta shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-base sm:text-[17px] font-semibold mb-1">
                  {title}
                </h3>
                <p className="text-[15px] leading-normal text-base-content/75">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-14 pb-14 sm:pb-24">
        <div className="max-w-[1216px] mx-auto bg-neutral text-neutral-content rounded-[20px] px-6 py-8 sm:p-12 lg:p-[72px] flex flex-wrap items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-[620px]">
            <h2 className="font-heading font-semibold text-[28px] sm:text-[44px] leading-[1.15] mb-3">
              Vos prochaines vacances à la montagne commencent ici
            </h2>
            <p className="text-base sm:text-[17px] leading-relaxed text-neutral-content/80">
              Consultez le calendrier en temps réel et réservez directement,
              sans intermédiaire.
            </p>
          </div>
          <Link
            href="#reserver"
            className="btn w-full sm:w-auto rounded-xl border-0 bg-neutral-content text-neutral hover:bg-neutral-content/90 px-7 h-auto min-h-12"
          >
            Voir les disponibilités
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
