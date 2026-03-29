"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DailySummary, Vehicle } from "@/lib/contracts";

type FleetRow = { vehicle: Vehicle; summary: DailySummary };

type Props = {
  children: React.ReactNode;
};

function ProfileSheet({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  const [rows, setRows] = useState<FleetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vehicles", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data as FleetRow[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = rows.reduce((s, r) => s + r.summary.total, 0);
  const totalTrips = rows.reduce((s, r) => s + r.summary.tripCount, 0);
  const anomalyCount = rows.filter((r) => r.summary.anomaly).length;
  // Use the first vehicle's ownerName as the fleet manager name, fallback if not loaded
  const managerName = rows[0]?.vehicle.ownerName ?? "Fleet Manager";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-4">
      <button
        type="button"
        aria-label="Close profile"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-[28px] bg-white px-5 pb-10 pt-5 md:rounded-3xl md:shadow-xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 md:hidden" />

        {/* Header */}
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#1E7A4A]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            {loading ? (
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="text-lg font-bold text-slate-900">{managerName}</p>
            )}
            <p className="mt-0.5 text-sm text-slate-500">Fleet owner · MateCheck</p>
          </div>
        </div>

        {/* Today's stats */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))
          ) : (
            <>
              <div className="rounded-2xl bg-[#1E7A4A]/8 px-3 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Vehicles</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{rows.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Trips</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{totalTrips}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
                <p className="mt-1 text-base font-bold text-[#1E7A4A]">
                  GHS {totalRevenue.toFixed(0)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Mini vehicle list */}
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {loading ? "Loading vehicles…" : `Fleet · ${rows.length} registered`}
          </p>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            ))
          ) : (
            rows.map((row) => (
              <Link
                key={row.vehicle.id}
                href={`/owner/${row.vehicle.id}`}
                onClick={onClose}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 active:bg-slate-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{row.vehicle.plate}</p>
                  <p className="truncate text-[11px] text-slate-500">{row.vehicle.route}</p>
                </div>
                <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    GHS {row.summary.total.toFixed(0)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      row.summary.anomaly
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {row.summary.anomaly ? "Review" : "OK"}
                  </span>
                </div>
              </Link>
            ))
          )}

          {!loading && anomalyCount > 0 ? (
            <p className="pt-1 text-[11px] text-amber-700">
              {anomalyCount} vehicle{anomalyCount > 1 ? "s" : ""} below normal earnings today
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href="/owner"
            onClick={onClose}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 active:bg-slate-50"
          >
            Fleet dashboard
            <span className="text-slate-400">→</span>
          </Link>
          <button
            type="button"
            onClick={() => { onClose(); onLogout(); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600 active:bg-red-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444" aria-hidden>
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerAppShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const fleetTabActive = pathname.startsWith("/owner");

  const navLinkClass = (active: boolean) =>
    active ? "text-[#1E7A4A]" : "text-slate-600 hover:text-[#1E7A4A]";

  function handleLogout() {
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="fixed left-0 right-0 top-0 z-30 hidden border-b border-slate-200 bg-white/95 backdrop-blur-sm md:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
          <Link href="/owner" className="text-lg font-bold tracking-tight text-[#1E7A4A]">
            MateCheck <span className="font-semibold text-slate-500">Owner</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-6 text-sm font-semibold">
            <Link href="/owner" className={navLinkClass(fleetTabActive)} aria-current={fleetTabActive ? "page" : undefined}>
              Fleet
            </Link>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="text-slate-600 hover:text-[#1E7A4A]"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600 transition-colors"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto min-h-screen w-full max-w-md shadow-[0_0_0_1px_rgba(15,23,42,0.06)] md:max-w-7xl md:shadow-none lg:px-6">
        <div className="pb-28 md:pb-10 md:pt-14">{children}</div>

        <nav
          aria-label="Owner navigation"
          className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-slate-100 bg-white px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/owner"
            aria-current={fleetTabActive ? "page" : undefined}
            className="flex flex-col items-center gap-1"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={fleetTabActive ? "#1E7A4A" : "#94A3B8"}
              aria-hidden
            >
              <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h11v2H3v-2zm0 4h11v2H3v-2zm13-1l5 5-5 5v-3h-4v-4h4v-3z" />
            </svg>
            <span className={`text-[10px] font-semibold ${fleetTabActive ? "text-[#1E7A4A]" : "text-slate-400"}`}>
              Fleet
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Owner profile"
            className="flex flex-col items-center gap-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-400">Profile</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex flex-col items-center gap-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden>
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-400">Log out</span>
          </button>
        </nav>

        {profileOpen ? (
          <ProfileSheet onClose={() => setProfileOpen(false)} onLogout={handleLogout} />
        ) : null}
      </div>
    </div>
  );
}
