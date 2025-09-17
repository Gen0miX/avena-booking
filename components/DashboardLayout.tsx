"use client";
import Image from "next/image";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaRegChartBar,
  FaCog,
} from "react-icons/fa";
import BookingTable from "./BookingTable";

const menuItems = [
  { key: "bookings", label: "Réservations", icon: <FaCalendarAlt /> },
  { key: "terminated", label: "Terminées", icon: <FaCalendarCheck /> },
  { key: "statistics", label: "Statistiques", icon: <FaRegChartBar /> },
  { key: "settings", label: "Paramètres", icon: <FaCog /> },
];

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  onMenuClick?: (key: string) => void;
  logoSrc: string;
}

export default function DashboardLayout({
  onMenuClick,
  logoSrc,
}: DashboardLayoutProps) {
  const [active, setActive] = useState("bookings");

  const renderContent = () => {
    switch (active) {
      case "bookings":
        return <BookingTable />;
      case "terminated":
        return <p>Historique des réservations à venir...</p>;
      case "statistics":
        return <p>Statistiques à venir...</p>;
      case "settings":
        return <p>Paramètres à venir...</p>;
      default:
        return null;
    }
  };

  const handleMenuItemClick = (key: string): void => {
    setActive(key);
    // Fermer le drawer après sélection sur mobile/tablet
    const drawerToggle = document.getElementById(
      "dashboard-drawer"
    ) as HTMLInputElement | null;
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  return (
    <div className="drawer lg:drawer-open h-full">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content - Important: pas de flex-col ici */}
      <div className="drawer-content h-full">
        {/* Mobile */}
        <div className="md:hidden h-full flex flex-col mb-16">
          <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
          <div className="dock dock-sm sm:dock-md">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={active === item.key ? "active text-primary" : ""}
                onClick={() => setActive(item.key)}
              >
                {item.icon}
                <span className="dock-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop - Container avec hauteur fixe et scroll interne */}
        <div className="hidden md:block h-full">
          <main className="h-full p-4 overflow-y-auto">{renderContent()}</main>
        </div>
      </div>

      {/* Sidebar - hauteur fixe */}
      <div className="drawer-side h-full">
        <label
          htmlFor="dashboard-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <aside className="h-full w-64 bg-base-200 p-4 pt-26 lg:pt-6 flex-shrink-0 overflow-y-auto">
          <div>
            <Image
              src={logoSrc}
              alt="logo Avena"
              width={120}
              height={0}
              quality={100}
              className="hidden md:block mb-6 mx-auto"
            />
          </div>
          <ul className="menu gap-2">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  className={`btn w-full justify-start ${
                    active === item.key ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => handleMenuItemClick(item.key)}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
