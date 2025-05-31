import ThemeToggleButton from "@/components/ThemeToggleButton";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="hero min-h-screen"
      style={{
        backgroundImage:
          "url(https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://www.myswitzerland.com/-/media/celum%20connect/2025/03/12/07/45/22/saas-fee-aerial.jpg)",
      }}
    >
      <div className="absolute top-3 right-3">
        <ThemeToggleButton></ThemeToggleButton>
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-xl">
          <h1 className="font-heading text-8xl font-bold">Avena</h1>
          <p className="text-2xl font-semibold mb-5">
            Appartement cosy au cœur de Saas-Fee
          </p>
          <p className="text-xl">
            Appartement proche des pistes & du centre, tout confort pour six
            personnes à Saas-Fee.
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
