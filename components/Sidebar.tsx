import Link from "next/link";
import type { DailySummary, Vehicle } from "@/lib/contracts";

interface SidebarProps {
  vehicle: Vehicle;
  summary: DailySummary;
  /** Which page is currently active in the sidebar nav */
  activePage?: "today" | "logs" | "log";
}

export default function Sidebar({ vehicle, summary, activePage = "today" }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 min-h-screen bg-[#1E7A4A] flex-col">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/10">
        <p className="text-base font-bold text-white tracking-wide">MateCheck</p>
        <p className="text-xs text-white/50 mt-0.5">
          {vehicle.plate} · {vehicle.route}
        </p>
      </div>

      {/* Today's total */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/50 mb-1.5">
          Today&apos;s Total
        </p>
        <p className="text-[34px] font-bold tracking-tight text-white leading-none mb-1">
          GHS {summary.total}
        </p>
        <p className="text-[11px] text-white/50">made so far today</p>
      </div>

      {/* Stats row */}
      <div className="px-5 pb-5 border-b border-white/10 flex gap-2">
        <div className="flex-1 bg-white/10 rounded-xl p-2.5">
          <p className="text-lg font-bold text-white">{summary.tripCount}</p>
          <p className="text-[10px] text-white/50 mt-0.5">Trips</p>
        </div>
        <div className="flex-1 bg-white/10 rounded-xl p-2.5">
          <p className="text-lg font-bold text-white">GHS {summary.avgPerTrip}</p>
          <p className="text-[10px] text-white/50 mt-0.5">Avg/trip</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="px-3 pt-4 flex-1" aria-label="Sidebar navigation">
        {/* Trip logs */}
        <Link
          href="/driver/logs"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 ${
            activePage === "logs" ? "bg-white/15" : ""
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true"
            className={activePage === "logs" ? "opacity-100" : "opacity-60"}>
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
          <span className={`text-sm font-medium ${activePage === "logs" ? "text-white" : "text-white/60"}`}>
            Trip logs
          </span>
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true" className="opacity-60">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-sm font-medium text-white/60">Profile</span>
        </div>
      </nav>

      {/* CTA — Log new trip (active styling when on log page) */}
      <div className="mx-3 mb-5 mt-auto">
        <Link
          href="/log-trip"
          className={`w-full rounded-xl px-4 py-3 flex items-center justify-center gap-2 min-h-[48px] ${
            activePage === "log"
              ? "bg-white/15"
              : "bg-[#155C37] shadow-[0_4px_14px_rgba(21,92,55,0.5)] border border-white/10"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span className="text-[13px] font-semibold text-white">Log new trip</span>
        </Link>
      </div>
    </aside>
  );
}
