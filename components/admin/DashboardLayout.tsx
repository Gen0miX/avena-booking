"use client";
import Image from "next/image";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaRegChartBar,
  FaCog,
  FaArrowLeft,
  FaBars,
  FaPowerOff,
} from "react-icons/fa";
import BookingTable from "@/components/admin/BookingTable";
import BookingDetails from "@/components/admin/BookingDetails";
import { BookingFilters } from "@/hooks/usebookings";

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
  onLogout?: () => void;
}

export default function DashboardLayout({
  onMenuClick,
  logoSrc,
  onLogout,
}: DashboardLayoutProps) {
  const [active, setActive] = useState("bookings");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [bookingsFilters, setBookingsFilters] = useState<BookingFilters | null>(
    null
  );
  const [terminatedFilters, setTerminatedFilters] =
    useState<BookingFilters | null>(null);

  const handleBookingSelect = (bookingId: number) => {
    setSelectedBookingId(bookingId);
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
  };

  const getPageTitle = () => {
    if (selectedBookingId) return "Détails de la réservation";
    const currentItem = menuItems.find((item) => item.key === active);
    return currentItem ? currentItem.label : "Dashboard";
  };

  const handleMenuToggle = () => {
    const drawerToggle = document.getElementById(
      "dashboard-drawer"
    ) as HTMLInputElement | null;
    if (drawerToggle) drawerToggle.checked = !drawerToggle.checked;
  };

  const renderContent = () => {
    if (selectedBookingId) {
      return (
        <div className="h-full">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={handleBackToList}
            >
              <FaArrowLeft />
            </button>
          </div>
          <BookingDetails
            bookingId={selectedBookingId}
            onBack={handleBackToList}
          />
        </div>
      );
    }

    switch (active) {
      case "bookings":
        return (
          <BookingTable
            key="current"
            onBookingSelect={handleBookingSelect}
            statusGroup="current"
            initialFilters={bookingsFilters ?? undefined}
            onFiltersChange={setBookingsFilters as (f: BookingFilters) => void}
          />
        );
      case "terminated":
        return (
          <BookingTable
            key="terminated"
            onBookingSelect={handleBookingSelect}
            statusGroup="terminated"
            initialFilters={terminatedFilters ?? undefined}
            onFiltersChange={
              setTerminatedFilters as (f: BookingFilters) => void
            }
          />
        );
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
    setSelectedBookingId(null);
    const drawerToggle = document.getElementById(
      "dashboard-drawer"
    ) as HTMLInputElement | null;
    if (drawerToggle) drawerToggle.checked = false; // ferme drawer sur mobile
  };

  return (
    <div className="drawer h-screen">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content — on décale sur desktop avec lg:ml-64 */}
      <div className="drawer-content flex flex-col h-screen lg:ml-64">
        {/* Header sticky */}
        <header className="flex justify-between items-center p-4 border-b border-primary/40 bg-base-100 z-10 flex-shrink-0 sticky top-0">
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
              onClick={handleMenuToggle}
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
          </div>
          {onLogout && (
            <button className="btn btn-circle btn-secondary" onClick={onLogout}>
              <FaPowerOff />
            </button>
          )}
        </header>

        {/* Contenu principal avec scroll */}
        <div className="flex-1 overflow-hidden">
          {/* Mobile dock */}
          <div className="md:hidden h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 pt-0 mb-10 sm:mb-12 md:mb-0">
              {renderContent()}
            </div>
            <div className="dock dock-sm sm:dock-md flex-shrink-0">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  className={active === item.key ? "active text-primary" : ""}
                  onClick={() => handleMenuItemClick(item.key)}
                >
                  {item.icon}
                  <span className="dock-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop - container avec scroll interne */}
          <div className="hidden md:block h-full overflow-y-auto">
            <main className="p-4">{renderContent()}</main>
          </div>
        </div>
      </div>

      {/* Drawer-side pour mobile/tablette (contrôlé par la checkbox). Caché sur lg */}
      <div className="drawer-side lg:hidden">
        <label
          htmlFor="dashboard-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <aside className="w-64 h-full pt-28 bg-base-200 border-r border-primary/40 p-4 flex flex-col">
          <div className="flex-shrink-0 mb-6">
            <Image
              src={logoSrc}
              alt="logo Avena"
              width={120}
              height={0}
              quality={100}
              className="mx-auto mb-5"
            />
          </div>
          <ul className="menu gap-2 flex-1 overflow-y-auto">
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

      {/* Sidebar fixe pour desktop (visible uniquement >= lg) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 pt-12 bg-base-200 border-r border-primary/40 p-4 flex-col">
        <div className="flex-shrink-0 mb-6">
          <Image
            src={logoSrc}
            alt="logo Avena"
            width={120}
            height={0}
            quality={100}
            className="mx-auto mb-5"
          />
        </div>
        <ul className="menu gap-2 flex-1 overflow-y-auto">
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
  );
}
