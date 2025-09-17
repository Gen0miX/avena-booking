"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { FaBars, FaPowerOff } from "react-icons/fa";

export default function DashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/admin"); // Redirige vers login
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "avenad"
      ? "/logos/logo_Avena_D.svg"
      : "/logos/logo_Avena_L.svg";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Une erreur c'est produite...");
    } else {
      router.push("/admin");
    }
  };

  const handleMenuClick = () => {
    const drawerToggle = document.getElementById(
      "dashboard-drawer"
    ) as HTMLInputElement | null;
    if (drawerToggle) {
      drawerToggle.checked = !drawerToggle.checked;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-ring loading-xl text-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-between items-center p-4 border-b border-base-300 bg-base-100 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Image
            src={logoSrc}
            alt="logo Avena"
            width={80}
            height={0}
            quality={100}
            className="md:hidden"
          />
          {/* Bouton menu pour tablet seulement */}
          <button
            className="btn btn-square btn-ghost hidden md:inline-flex lg:hidden"
            onClick={handleMenuClick}
          >
            <FaBars size={20} />
          </button>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <button className="btn btn-circle btn-secondary" onClick={handleLogout}>
          <FaPowerOff className="" />
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        <DashboardLayout onMenuClick={handleMenuClick} logoSrc={logoSrc} />
      </div>

      {error && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
