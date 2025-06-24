"use client";

import { use, useEffect, useState } from "react";
import { IoMailOutline, IoKeyOutline } from "react-icons/io5";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function admin() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "avenad"
      ? "/logos/logo_Avena_D.svg"
      : "/logos/logo_Avena_L.svg";

  const handleLogin = async () => {
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center xl:mx-auto h-svh">
      <fieldset className="fieldset bg-base-200 p-5 rounded-box border border-primary/40 shadow-lg mb-20 lg:w-96">
        <legend className="fieldset-legend text-3xl font-bold font-heading text-accent">
          Connexion
        </legend>
        <div className="flex justify-center mb-10">
          <Image
            src={logoSrc}
            alt="logo Avena"
            width={150}
            height={0}
            quality={100}
          ></Image>
        </div>
        <label className="input input-accent w-full">
          <IoMailOutline className="text-xl text-base-content/70" />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="input input-accent w-full">
          <IoKeyOutline className="text-xl text-base-content/70" />
          <input
            type="password"
            placeholder="Mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-error text-sm ml-1">{error}</p>}
        <button className="btn btn-accent w-full mt-10" onClick={handleLogin}>
          Se connecter
        </button>
      </fieldset>
    </section>
  );
}
