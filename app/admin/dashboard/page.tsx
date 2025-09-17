"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { FaBars } from "react-icons/fa";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
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
          {/* Bouton menu pour tablet seulement */}
          <button
            className="btn btn-square btn-ghost hidden md:block lg:hidden"
            onClick={handleMenuClick}
          >
            <FaBars size={20} />
          </button>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        <DashboardLayout onMenuClick={handleMenuClick} />
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
