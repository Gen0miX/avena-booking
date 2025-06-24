import ThemeToggleButton from "@/components/ThemeToggleButton";
import Link from "next/link";
import Image from "next/image";
import heroImage from "@/public/images/hero.webp";

export default function Hero() {
  return (
    <section className="hero min-h-svh relative overflow-hidden">
      <div className="fixed inset-0 w-full h-full -z-10" aria-hidden="true">
        <Image
          src={heroImage}
          alt="Saas-fee landscape with moutains"
          placeholder="blur"
          fill
          priority
          quality={100}
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="absolute top-0 left-0 w-full">
        <div className="flex justify-between items-center m-3 mt-5 sm:mx-5 sm:mt-7">
          <div className="flex text-neutral-content gap-3 sm:gap-5">
            <Link href="#home" className="link link-hover ">
              Home
            </Link>
            <Link href="/booking" className="link link-hover">
              Réservation
            </Link>
          </div>
          <div className="flex gap-3 sm:gap-5">
            <ThemeToggleButton className="btn btn-ghost btn-circle"></ThemeToggleButton>
          </div>
        </div>
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-xl">
          <h1 className="font-heading text-8xl font-bold">Avena</h1>
          <p className="text-2xl font-semibold mb-5">
            Appartement cosy au cœur de Saas-Fee
          </p>
          <p className="text-xl">
            Proche des pistes & du centre, tout confort pour deux à cinq
            personnes.
          </p>
          <p className="italic textl-xl">
            Deux chambres, salon lumineux et cuisine équipée.
          </p>
          <div>
            <Link
              href="/booking"
              className="btn btn-secondary font-p text-lg mt-5"
            >
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
