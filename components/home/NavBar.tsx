"use client";

import Image from "next/image";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { IoMenuOutline } from "react-icons/io5";

type NavBarProps = {
  /** Over the hero photo: transparent background, light logo and text. */
  overlay?: boolean;
};

export const NAV_LINKS = [
  { href: "/#appartements", label: "Appartements" },
  { href: "/#saas-fee", label: "Saas-Fee" },
  { href: "/#infos", label: "Infos pratiques" },
];

export default function NavBar({ overlay = false }: NavBarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Sur la photo du hero, le logo sombre (couleurs claires) est toujours le plus lisible.
  const darkLogo = overlay || (mounted && resolvedTheme === "avenad");
  const logoSrc = darkLogo
    ? "/logos/logo_Avena_D.svg"
    : "/logos/logo_Avena_L.svg";

  const ink = overlay ? "text-white" : "text-base-content";

  return (
    <nav
      aria-label="Navigation principale"
      className={
        overlay
          ? "relative z-10"
          : "bg-surface border-b border-base-300 shadow-sm"
      }
    >
      <div className="max-w-[1328px] mx-auto px-4 sm:px-8 lg:px-14 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Avena, accueil" className="shrink-0">
          <Image
            src={logoSrc}
            alt="Avena"
            width={96}
            height={50}
            className="h-11 sm:h-12 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden md:inline-flex px-3.5 py-3 text-[15px] hover:opacity-75 ${ink}`}
            >
              {link.label}
            </Link>
          ))}

          <ThemeToggleButton
            className={`btn btn-circle btn-ghost border ${
              overlay ? "border-white/45" : "border-base-300"
            }`}
            iconSize={18}
            colorIcon={ink}
          />

          <details className="dropdown dropdown-end md:hidden">
            <summary
              aria-label="Ouvrir le menu"
              className={`btn btn-circle btn-ghost border list-none ${
                overlay ? "border-white/45 text-white" : "border-base-300"
              }`}
            >
              <IoMenuOutline size={22} />
            </summary>
            <ul className="menu dropdown-content bg-surface text-base-content rounded-box shadow-lg mt-2 w-52 p-2 z-50">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="py-3">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          <Link
            href="/booking"
            className={`btn rounded-full px-5 ml-1 sm:ml-2 border-0 ${
              overlay
                ? "bg-white text-[#2B3240] hover:bg-white/90"
                : "bg-base-content text-base-100 hover:bg-base-content/90"
            }`}
          >
            Réserver
          </Link>
        </div>
      </div>
    </nav>
  );
}
