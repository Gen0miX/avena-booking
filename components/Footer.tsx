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
      className={`footer sm:footer-horizontal bg-base-200 text-base-content p-10 border-t border-primary/40 ${className}`}
    >
      <aside className="items-center grid-flow-col">
        <Link href={"/"} className="min-w-16">
          <Image
            src={logoSrc}
            alt="logo Avena"
            width={75}
            height={0}
            quality={100}
          ></Image>
        </Link>
        <p className="ml-1">
          Copyright © 2025 -{" "}
          <Link
            href={"https://www.jonas-pilloud.ch/"}
            className="link link-hover"
          >
            Jonas Pilloud
          </Link>
        </p>
      </aside>
      <nav>
        <h6 className="footer-title">Legal</h6>
        <a className="link link-hover">Terms of use</a>
        <a className="link link-hover">Privacy policy</a>
        <a className="link link-hover">Cookie policy</a>
      </nav>
    </footer>
  );
}
