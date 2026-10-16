import Image from "next/image";
import heroImage from "@/public/images/hero.webp";
import heroImage2 from "@/public/images/hero2.webp";
import { useEffect, useState } from "react";
import NavBar from "@/components/home/NavBar";

export default function Hero() {
  const images = [heroImage, heroImage2];
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 11000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative min-h-[640px] h-[88svh] max-h-[900px] flex flex-col text-white overflow-hidden">
      {/* Background slideshow */}
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <Image
            src={img}
            alt=""
            placeholder="blur"
            fill
            priority={i === 0}
            quality={100}
            sizes="100vw"
            style={{
              objectFit: "cover",
              transform: i === index ? "scale(1)" : "scale(1.04)",
              transition: "transform 8s ease",
            }}
          />
        </div>
      ))}
      {/* Filtre : voile bleu nuit léger + dégradés haut/bas + halo derrière le texte */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#141a26]/25" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,20,32,0.6)_0%,rgba(15,20,32,0.1)_30%,rgba(15,20,32,0.3)_58%,rgba(15,20,32,0.88)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_15%_85%,rgba(15,20,32,0.55)_0%,rgba(15,20,32,0)_70%)]"
      />
      <NavBar overlay />

      <div className="relative flex-1 flex flex-col justify-end w-full max-w-[1328px] mx-auto px-5 sm:px-8 lg:px-14 pb-28 sm:pb-36">
        <p className="mb-3 sm:mb-4 text-xs sm:text-[13px] tracking-[0.22em] uppercase font-medium">
          Saas-Fee · 1800 m · Valais
        </p>
        <h1 className="[text-shadow:0_2px_24px_rgba(10,14,24,0.35)] font-heading font-semibold text-[42px] leading-[1.05] sm:text-6xl lg:text-[88px] lg:leading-[1.02] max-w-[820px]">
          Deux appartements au cœur du village des glaciers
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-[19px] leading-relaxed max-w-[560px] text-white/90">
          Au centre de la station piétonne, proches des pistes et des sentiers.
          Tout le confort pour 2 à 6 personnes, été comme hiver.
        </p>
      </div>
    </header>
  );
}
