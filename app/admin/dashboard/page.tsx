"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import BookingTable from "@/components/BookingTable";
import { div } from "framer-motion/client";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-ring loading-xl text-primary"></div>
      </div>
    );
  }

  return (
    <main className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-heading font-semibold mb-6">
        Tableau des réservations
      </h1>
      <BookingTable />
      <button className="btn btn-primary" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}
