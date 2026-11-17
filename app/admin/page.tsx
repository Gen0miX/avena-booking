"use client";

import { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import heroImage from "@/public/images/hero.webp";

export default function AdminLogin() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/admin/dashboard");
      } else {
        setMounted(true);
      }
    };
    checkSession();
  }, [supabase, router]);

  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "avenad"
      ? "/logos/logo_Avena_D.svg"
      : "/logos/logo_Avena_L.svg";

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email ou mot de passe incorrect");
      setIsSubmitting(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <main className="min-h-svh grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] bg-base-100 text-base-content">
      {/* Visuel : la photo du site avec le même voile que le hero */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-14 text-white">
        <Image
          src={heroImage}
          alt=""
          placeholder="blur"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[#141a26]/25" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,20,32,0.6)_0%,rgba(15,20,32,0.1)_30%,rgba(15,20,32,0.3)_58%,rgba(15,20,32,0.88)_100%)]"
        />

        <Image
          src="/logos/logo_Avena_D.svg"
          alt="Avena"
          width={110}
          height={58}
          className="relative h-14 w-auto self-start"
        />

        <div className="relative max-w-md">
          <p className="mb-3 text-[13px] tracking-[0.22em] uppercase font-medium">
            Espace propriétaire
          </p>
          <p className="font-heading font-semibold text-4xl xl:text-5xl leading-[1.08] [text-shadow:0_2px_24px_rgba(10,14,24,0.35)]">
            Réservations, tarifs et disponibilités au même endroit.
          </p>
        </div>
      </aside>

      {/* Formulaire */}
      <section className="flex flex-col px-5 sm:px-10 py-6 sm:py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-base-content py-2.5"
          >
            <IoArrowBackOutline size={16} aria-hidden="true" />
            Retour au site
          </Link>
          <ThemeToggleButton
            className="btn btn-circle btn-ghost border border-base-300"
            iconSize={18}
            colorIcon="text-base-content"
          />
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <form onSubmit={handleLogin} className="w-full max-w-[400px]">
            <Image
              src={logoSrc}
              alt="Avena"
              width={110}
              height={58}
              className="h-14 w-auto mb-10 lg:hidden"
            />
            <h1 className="font-heading font-semibold text-[40px] leading-tight mb-2">
              Connexion
            </h1>
            <p className="text-base text-base-content/75 mb-8">
              Accédez au tableau de bord de gestion d&apos;Avena.
            </p>

            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">E-mail</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  className={`input w-full h-12 rounded-xl bg-surface ${
                    error ? "input-error" : ""
                  }`}
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <div
                  className={`input w-full h-12 rounded-xl bg-surface pr-1 ${
                    error ? "input-error" : ""
                  }`}
                >
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    aria-pressed={showPassword}
                    className="btn btn-ghost btn-circle btn-sm size-10 text-base-content/70"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size={18} aria-hidden="true" />
                    ) : (
                      <IoEyeOutline size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="alert alert-error py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn h-auto min-h-12 mt-2 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90 text-base"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[13px] text-base-content/60">
          Accès réservé aux propriétaires.
        </p>
      </section>
    </main>
  );
}
