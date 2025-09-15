import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

type FooterProps = {
  className?: string;
};

export default function Footer({ className = "" }: FooterProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "avenad"
      ? "/logos/logo_Avena_D.svg"
      : "/logos/logo_Avena_L.svg";

  return (
    <footer
      className={`footer md:footer-horizontal bg-base-200 text-base-content p-10 border-t border-primary/40 justify-between items-center ${className}`}
    >
      {/* Partie gauche : Logo + Copyright */}
      <aside className="flex items-center gap-3">
        <Link href={"/"} className="min-w-16">
          <Image
            src={logoSrc}
            alt="logo Avena"
            width={75}
            height={0}
            quality={100}
          />
        </Link>
        <p className="text-sm">
          © 2025{" "}
          <Link
            href="https://www.jonas-pilloud.ch/"
            className="link link-hover"
          >
            Jonas Pilloud
          </Link>
          . Tous droits réservés.
        </p>
      </aside>

      {/* Partie droite : Liens légaux */}
      <nav className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm lg:mx-12">
        <Link href="/conditions-generales" className="link link-hover">
          Conditions générales
        </Link>
        <Link href="/politique-confidentialite" className="link link-hover">
          Politique de confidentialité
        </Link>
        <Link href="/cookies" className="link link-hover">
          Mentions légales
        </Link>
      </nav>
    </footer>
  );
}
