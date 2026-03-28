"use client";

import { useRouter } from "next/navigation";
import { sampleVehicles, summarizeTrips, todayAccra } from "@/lib/sampleData";
import Sidebar from "@/components/Sidebar";
import LogTripForm from "@/components/LogTripForm";

export default function LogTripPage() {
  const router = useRouter();
  const vehicle = sampleVehicles[0]!;
  const summary = summarizeTrips(vehicle.id, todayAccra);

  return (
    <div className="bg-[#F8FAFC]">
      {/* ===== MOBILE layout (hidden at md) ===== */}
      <div className="flex flex-col h-screen overflow-hidden md:hidden">
        {/* Green header */}
        <div className="flex-shrink-0 bg-[#1E7A4A] rounded-b-3xl px-6 pt-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => router.push("/driver")}
              aria-label="Go back"
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)" aria-hidden="true">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
              </svg>
            </button>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Log a trip</p>
              <p className="text-xs text-white/60">Speak or type the details</p>
            </div>
          </div>

          {/* Vehicle pill */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
            <span className="text-xs font-medium text-white">
              {vehicle.plate} · {vehicle.route}
            </span>
          </div>
        </div>

        {/* Scrollable form + pinned submit */}
        <LogTripForm variant="mobile" />
      </div>

      {/* ===== DESKTOP layout (shown at md) ===== */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <Sidebar vehicle={vehicle} summary={summary} activePage="log" />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => router.push("/driver")}
              aria-label="Go back"
              className="w-[30px] h-[30px] rounded-full bg-slate-100 flex items-center justify-center cursor-pointer flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748B" aria-hidden="true">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
              </svg>
            </button>
            <span className="text-[15px] font-semibold text-slate-900">Log a trip</span>
            <span className="text-xs text-slate-400 ml-auto">
              {vehicle.plate} · {vehicle.route}
            </span>
          </div>

          {/* Scrollable form + desktop footer */}
          <LogTripForm variant="desktop" />
        </div>
      </div>
    </div>
  );
}
