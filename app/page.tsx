"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import SectionTitle from "@/components/home/SectionTitle";
import { APARTMENT_LIST } from "@/config/apartments";

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
    <>
      <AnimatePresence mode="wait">
        {showNavBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50"
          >
            <NavBar />
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={heroRef} className="">
        <Hero />
      </div>
      <div className="bg-base-100 pt-16 sm:pt-20 pb-5">
        <section
          id="appartements"
          className="xl:max-w-6xl xl:mx-auto mx-1 sm:mx-5 scroll-mt-[72px] py-10"
        >
          <SectionTitle>Nos appartements</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {APARTMENT_LIST.map((apartment) => (
              <Link
                key={apartment.slug}
                href={`/appartements/${apartment.slug}`}
                className="card bg-base-200 border-2 border-primary/40 rounded-box overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-56 w-full bg-base-300">
                  {apartment.gallery[0] ? (
                    <Image
                      src={apartment.gallery[0].src}
                      alt={apartment.gallery[0].alt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-base-content/50">
                      Photos à venir
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{apartment.name}</h3>
                  <p className="text-sm text-base-content/70">
                    {apartment.address}
                  </p>
                  <p className="text-sm text-base-content/70">
                    Jusqu&apos;à {apartment.capacity} personnes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
