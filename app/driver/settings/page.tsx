"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KNOWN_ROUTES, getDefaultRoute, setDefaultRoute } from "@/lib/knownRoutes";
import { sampleVehicles } from "@/lib/sampleData";

const vehicle = sampleVehicles[0]!;

export default function DriverSettingsPage() {
  const router = useRouter();
  const [selected, setSelected]   = useState("");
  const [saved,    setSaved]      = useState(false);

  useEffect(() => {
    setSelected(getDefaultRoute() || vehicle.route);
  }, []);

  function handleSave() {
    setDefaultRoute(selected);
    setSaved(true);
    setTimeout(() => router.push("/driver"), 800);
  }

  // Build list: vehicle's assigned route first, then the rest
  const routes = [vehicle.route, ...KNOWN_ROUTES.filter(r => r !== vehicle.route)];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* Header */}
      <div className="bg-[#1A6B41] px-5 pt-5 pb-6">
        <div className="flex items-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25 flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
            </svg>
          </button>
          <div>
            <p className="text-[16px] font-bold text-white">Driver Settings</p>
            <p className="text-[11px] text-white/50 mt-0.5">{vehicle.plate}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5 pb-28 space-y-4">

        {/* Default Route section */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[14px] font-bold text-slate-900">Default Route</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              This route will appear first in the dropdown when logging trips
            </p>
          </div>

          <div className="divide-y divide-slate-50">
            {routes.map((route) => (
              <button
                key={route}
                type="button"
                onClick={() => { setSelected(route); setSaved(false); }}
                className="w-full flex items-center gap-3 px-5 py-4 active:bg-slate-50 transition-colors text-left"
              >
                {/* Radio indicator */}
                <div className={[
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  selected === route ? "border-[#1A6B41]" : "border-slate-300",
                ].join(" ")}>
                  {selected === route ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1A6B41]" />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={[
                    "text-[13px] leading-snug truncate",
                    selected === route ? "font-semibold text-slate-900" : "font-medium text-slate-700",
                  ].join(" ")}>
                    {route}
                  </p>
                  {route === vehicle.route ? (
                    <p className="text-[10px] text-[#1A6B41] font-medium mt-0.5">Assigned route</p>
                  ) : null}
                </div>

                {selected === route ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A6B41" aria-hidden="true" className="flex-shrink-0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle info card */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm px-5 py-4">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3">Vehicle</p>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Plate</span>
              <span className="text-sm font-semibold text-slate-900">{vehicle.plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Owner</span>
              <span className="text-sm font-semibold text-slate-900">{vehicle.ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Assigned route</span>
              <span className="text-sm font-semibold text-slate-900">{vehicle.route}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save button — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 shadow-[0_-2px_16px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleSave}
          className={[
            "w-full rounded-2xl py-4 text-[15px] font-bold transition-all",
            saved
              ? "bg-emerald-100 text-emerald-700"
              : "bg-[#1A6B41] text-white shadow-[0_4px_14px_rgba(26,107,65,0.3)] active:bg-[#155C37]",
          ].join(" ")}
        >
          {saved ? "Saved ✓ Going back…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
