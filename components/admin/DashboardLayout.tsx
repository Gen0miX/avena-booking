"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  IoCalendarOutline,
  IoCalendarClearOutline,
  IoBarChartOutline,
  IoSettingsOutline,
  IoOpenOutline,
  IoMoonOutline,
  IoSunnyOutline,
  IoLogOutOutline,
  IoPersonOutline,
} from "react-icons/io5";
import BookingTable from "@/components/admin/BookingTable";
import BookingDetails from "@/components/admin/BookingDetails";
import { BookingFilters, useBookings } from "@/hooks/usebookings";
import { Booking } from "@/lib/bookings";
import StatisticsDashboard from "@/components/admin/statistics/StatisticsDashboard";
import SettingsPage from "@/components/admin/settings/SettingsPage";
import { APARTMENT_LIST, ApartmentSlug } from "@/config/apartments";

type SelectedApartment = ApartmentSlug | "all";
type MenuKey = "bookings" | "terminated" | "statistics" | "settings";

const menuItems: { key: MenuKey; label: string; icon: React.ReactNode }[] = [
  { key: "bookings", label: "Réservations", icon: <IoCalendarOutline size={19} /> },
  { key: "terminated", label: "Terminées", icon: <IoCalendarClearOutline size={19} /> },
  { key: "statistics", label: "Statistiques", icon: <IoBarChartOutline size={19} /> },
  { key: "settings", label: "Paramètres", icon: <IoSettingsOutline size={19} /> },
];

interface DashboardLayoutProps {
  logoSrc: string;
  onLogout?: () => void;
}

export default function DashboardLayout({ logoSrc, onLogout }: DashboardLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState<MenuKey>("bookings");
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment>(
    APARTMENT_LIST[0].slug,
  );
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [bookingsFilters, setBookingsFilters] = useState<BookingFilters | null>(null);
  const [terminatedFilters, setTerminatedFilters] = useState<BookingFilters | null>(null);

  // Badge "à confirmer" dans la navigation (même cache SWR que la liste)
  const { allBookings } = useBookings(selectedApartment, undefined, "nav");
  const pendingCount = (allBookings as Booking[]).filter((b) => b.status.id === 1).length;

  // Les paramètres sont propres à un appartement : pas de vue "Tous"
  useEffect(() => {
    if (active === "settings" && selectedApartment === "all") {
      setSelectedApartment(APARTMENT_LIST[0].slug);
    }
  }, [active, selectedApartment]);

  const apartmentOptions: { value: SelectedApartment; label: string }[] = [
    ...APARTMENT_LIST.map((a) => ({ value: a.slug, label: a.name })),
    ...(active === "settings" ? [] : [{ value: "all" as const, label: "Tous" }]),
  ];

  const currentItem = menuItems.find((item) => item.key === active)!;
  const apartmentLabel =
    selectedApartment === "all"
      ? "Tous les appartements"
      : APARTMENT_LIST.find((a) => a.slug === selectedApartment)?.name;
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const subtitle =
    active === "bookings"
      ? today.charAt(0).toUpperCase() + today.slice(1)
      : active === "settings"
        ? "Réglages propres à chaque appartement"
        : apartmentLabel;

  const handleMenuItemClick = (key: MenuKey) => {
    setActive(key);
    setSelectedBookingId(null);
  };

  const isDark = resolvedTheme === "avenad";
  const toggleTheme = () => setTheme(isDark ? "avenal" : "avenad");

  const renderContent = () => {
    if (selectedBookingId) {
      return (
        <BookingDetails
          bookingId={selectedBookingId}
          onBack={() => setSelectedBookingId(null)}
        />
      );
    }
    switch (active) {
      case "bookings":
        return (
          <BookingTable
            key="current"
            onBookingSelect={setSelectedBookingId}
            statusGroup="current"
            apartment={selectedApartment}
            initialFilters={bookingsFilters ?? undefined}
            onFiltersChange={setBookingsFilters as (f: BookingFilters) => void}
          />
        );
      case "terminated":
        return (
          <BookingTable
            key="terminated"
            onBookingSelect={setSelectedBookingId}
            statusGroup="terminated"
            apartment={selectedApartment}
            initialFilters={terminatedFilters ?? undefined}
            onFiltersChange={setTerminatedFilters as (f: BookingFilters) => void}
          />
        );
      case "statistics":
        return <StatisticsDashboard apartment={selectedApartment} />;
      case "settings":
        return selectedApartment === "all" ? null : (
          <SettingsPage apartmentSlug={selectedApartment} />
        );
    }
  };

  const ApartmentSwitch = ({ className = "" }: { className?: string }) => (
    <div
      role="radiogroup"
      aria-label="Appartement"
      className={`flex bg-base-300/60 rounded-xl p-1 gap-1 ${className}`}
    >
      {apartmentOptions.map((option) => {
        const checked = selectedApartment === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setSelectedApartment(option.value)}
            className={`flex-1 px-4 py-2 rounded-[9px] text-sm transition-colors ${
              checked
                ? "bg-surface font-semibold shadow-sm"
                : "text-base-content/75 hover:text-base-content"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  const sideLink =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-base-content/80 hover:bg-base-200 w-full text-left";

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* Menu latéral (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] flex-col gap-7 bg-surface border-r border-base-300 px-4 py-6 z-30">
        <div className="flex flex-col items-center gap-2">
          <Image src={logoSrc} alt="Avena" width={96} height={50} className="h-11 w-auto" />
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-base-content/70 border border-base-300 rounded-md px-1.5 py-0.5">
            Admin
          </span>
        </div>
        <nav aria-label="Navigation admin" className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const current = active === item.key && !selectedBookingId;
            const highlighted = active === item.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-current={current ? "page" : undefined}
                onClick={() => handleMenuItemClick(item.key)}
                className={`${sideLink} ${
                  highlighted ? "bg-cta/15 text-base-content font-semibold hover:bg-cta/20" : ""
                }`}
              >
                <span className={highlighted ? "text-cta" : ""}>{item.icon}</span>
                {item.label}
                {item.key === "bookings" && pendingCount > 0 && (
                  <span className="ml-auto bg-cta text-cta-content text-xs font-semibold rounded-full px-2 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-base-300 pt-4">
          <Link href="/" className={sideLink}>
            <IoOpenOutline size={19} aria-hidden="true" />
            Voir le site
          </Link>
          <button type="button" onClick={toggleTheme} className={sideLink}>
            {isDark ? (
              <IoSunnyOutline size={19} aria-hidden="true" />
            ) : (
              <IoMoonOutline size={19} aria-hidden="true" />
            )}
            {isDark ? "Thème clair" : "Thème sombre"}
          </button>
          {onLogout && (
            <button type="button" onClick={onLogout} className={`${sideLink} text-error`}>
              <IoLogOutOutline size={19} aria-hidden="true" />
              Se déconnecter
            </button>
          )}
        </div>
      </aside>

      {/* En-tête (mobile / tablette) */}
      <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-base-300 px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={logoSrc} alt="Avena" width={80} height={42} className="h-10 w-auto" />
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-base-content/70 border border-base-300 rounded-md px-1.5 py-0.5">
              Admin
            </span>
          </div>
          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              aria-label="Menu du compte"
              className="btn btn-circle btn-ghost border border-base-300"
            >
              <IoPersonOutline size={18} />
            </button>
            <ul tabIndex={0} className="dropdown-content menu bg-surface rounded-box shadow-lg z-40 w-56 p-2 mt-2">
              <li>
                <Link href="/">
                  <IoOpenOutline aria-hidden="true" /> Voir le site
                </Link>
              </li>
              <li>
                <button type="button" onClick={toggleTheme}>
                  {isDark ? <IoSunnyOutline aria-hidden="true" /> : <IoMoonOutline aria-hidden="true" />}
                  {isDark ? "Thème clair" : "Thème sombre"}
                </button>
              </li>
              {onLogout && (
                <li>
                  <button type="button" onClick={onLogout} className="text-error">
                    <IoLogOutOutline aria-hidden="true" /> Se déconnecter
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
        {!selectedBookingId && <ApartmentSwitch />}
      </header>

      {/* Contenu */}
      <main className="lg:pl-[248px] pb-24 lg:pb-0">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-14 py-5 lg:py-7 flex flex-col gap-5 lg:gap-6">
          {!selectedBookingId && (
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-base-content/65 mb-1">{subtitle}</p>
                <h1 className="font-heading font-semibold text-[28px] lg:text-4xl leading-tight">
                  {currentItem.label}
                </h1>
              </div>
              <ApartmentSwitch className="hidden lg:flex" />
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Navigation basse (mobile / tablette) */}
      <nav
        aria-label="Navigation admin"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-base-300 grid grid-cols-4 px-1 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))]"
      >
        {menuItems.map((item) => {
          const highlighted = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={highlighted && !selectedBookingId ? "page" : undefined}
              onClick={() => handleMenuItemClick(item.key)}
              className={`relative flex flex-col items-center gap-1 py-1.5 text-[11px] ${
                highlighted ? "font-semibold text-base-content" : "text-base-content/70"
              }`}
            >
              <span className={`px-4 py-1 rounded-full ${highlighted ? "bg-cta/15 text-cta" : ""}`}>
                {item.icon}
              </span>
              {item.label}
              {item.key === "bookings" && pendingCount > 0 && (
                <span className="absolute top-0.5 right-[calc(50%-24px)] bg-cta text-cta-content text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
