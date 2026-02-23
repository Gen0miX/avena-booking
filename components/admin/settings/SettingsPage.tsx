"use client";

import { useState } from "react";
import PricingPeriodsManager from "./PricingPeriodsManager";
import GeneralSettings from "./GeneralSettings";
import { FaMoneyBillWave, FaCog } from "react-icons/fa";

type SettingsTab = "pricing" | "general";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("pricing");

  return (
    <div className="py-4 sm:p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-base-200 p-4 rounded-box shadow-sm gap-4 border border-primary/20">
        <h2 className="text-xl font-bold">Paramètres</h2>

        <div className="join">
          <button
            className={`join-item btn btn-sm ${activeTab === "pricing" ? "btn-active btn-primary" : "bg-base-100"}`}
            onClick={() => setActiveTab("pricing")}
          >
            <FaMoneyBillWave className="mr-2" />
            Tarification
          </button>
          <button
            className={`join-item btn btn-sm ${activeTab === "general" ? "btn-active btn-primary" : "bg-base-100"}`}
            onClick={() => setActiveTab("general")}
          >
            <FaCog className="mr-2" />
            Général
          </button>
        </div>
      </div>

      {activeTab === "pricing" && <PricingPeriodsManager />}
      {activeTab === "general" && <GeneralSettings />}
    </div>
  );
}
