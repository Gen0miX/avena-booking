"use client";

import Image from "next/image";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { use, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function NavBar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "avenad"
      ? "/logos/logo_Avena_D.svg"
      : "/logos/logo_Avena_L.svg";

  return (
    <div className="navbar bg-base-200 absolute top-0 z-50 border-b border-primary/40">
      <div className="navbar-start gap-1 sm:gap-4">
        <Link href={"/"} className="sm:ml-2 min-w-16">
          <Image
            src={logoSrc}
            alt="logo Avena"
            width={100}
            height={0}
            quality={100}
          ></Image>
        </Link>
        <Link href="/#home" className="btn btn-ghost font-normal">
          Home
        </Link>

        <Link href="/booking" className="btn btn-ghost font-normal">
          Réservation
        </Link>
      </div>
      <div className="navbar-end ">
        <ThemeToggleButton
          className="btn btn-sm btn-neutral btn-circle sm:mr-5"
          iconSize={20}
        ></ThemeToggleButton>
      </div>
    </div>
  );
}
