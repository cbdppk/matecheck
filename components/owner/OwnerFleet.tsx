"use client";

import { useCallback, useEffect, useState } from "react";
import type { DailySummary, Vehicle } from "@/lib/contracts";
import VehicleCard from "@/components/owner/VehicleCard";

type FleetRow = { vehicle: Vehicle; summary: DailySummary };

function todayAccraLabel(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function OwnerFleet() {
  const [items, setItems] = useState<FleetRow[]>([]);
  const [error, setError] = useState("");
  const [dateLabel, setDateLabel] = useState(todayAccraLabel);
  const anomalyCount = items.filter((row) => row.summary.anomaly).length;
  const onTrackCount = items.length - anomalyCount;
  const totalTrips = items.reduce((acc, row) => acc + row.summary.tripCount, 0);
  const totalRevenue = items.reduce((acc, row) => acc + row.summary.total, 0);

  const load = useCallback(async () => {
    setDateLabel(todayAccraLabel());
    try {
      const response = await fetch("/api/vehicles", { cache: "no-store" });
      const data = (await response.json()) as FleetRow[] | { error?: string };

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(
          typeof data === "object" && data && "error" in data
            ? String((data as { error?: string }).error)
            : "Could not load fleet",
        );
      }

      setItems(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load fleet");
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="owner-dashboard">
      <section className="owner-main-column">
        <div className="section-card border-none bg-transparent p-0 shadow-none">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Owner</p>
              <h1 className="mt-2 text-3xl font-bold text-ink md:text-4xl">Your Fleet</h1>
            </div>

            <div className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
              {dateLabel}
            </div>
          </div>

          <div className="mt-4 hidden items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 md:grid md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Fleet Size</p>
              <p className="mt-1 text-lg font-semibold text-ink">{items.length}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">On Track</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{onTrackCount}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Needs Attention</p>
              <p className="mt-1 text-lg font-semibold text-red-700">{anomalyCount}</p>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {items.length === 0 && !error ? (
          <p className="mt-6 rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
            No vehicles are available yet. Your fleet cards will appear here once data is synced.
          </p>
        ) : null}

        <div className="owner-fleet-grid mt-6">
          {items.map((row) => (
            <VehicleCard key={row.vehicle.id} vehicle={row.vehicle} summary={row.summary} />
          ))}
        </div>
      </section>

      <aside className="owner-desktop-rail">
        <div className="section-card">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Today Overview</p>
          <p className="mt-2 text-3xl font-bold text-ink">GHS {totalRevenue.toFixed(2)}</p>
          <p className="mt-2 text-sm text-gray-600">Across {totalTrips} trips from {items.length} vehicles.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill bg-emerald-100 text-emerald-700">{onTrackCount} on track</span>
            <span className="pill bg-red-100 text-red-700">{anomalyCount} low earnings</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
