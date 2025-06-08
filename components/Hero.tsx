import ThemeToggleButton from "@/components/ThemeToggleButton";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="hero min-h-svh bg-fixed bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url(https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://www.myswitzerland.com/-/media/celum%20connect/2025/03/12/07/45/22/saas-fee-aerial.jpg)",
      }}
    >
      <div className="absolute top-0 left-0 w-full">
        <div className="flex justify-between items-center m-3 mt-5 sm:mx-5 sm:mt-7">
          <div className="flex text-neutral-content gap-3 sm:gap-5">
            <Link href="#home" className="link link-hover ">
              Home
            </Link>
            <Link href="/" className="link link-hover">
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
            <Link href={"/"} className="btn btn-secondary font-p text-lg mt-5">
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
