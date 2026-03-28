"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DailySummary, Vehicle } from "@/lib/contracts";
import FleetRevenueChart, { type FleetChartBar } from "@/components/owner/FleetRevenueChart";
import OwnerSection from "@/components/owner/OwnerSection";
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
  const [chartBars, setChartBars] = useState<FleetChartBar[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateLabel, setDateLabel] = useState(todayAccraLabel);
  const anomalyCount = items.filter((row) => row.summary.anomaly).length;
  const onTrackCount = items.length - anomalyCount;
  const totalTrips = items.reduce((acc, row) => acc + row.summary.tripCount, 0);
  const totalRevenue = items.reduce((acc, row) => acc + row.summary.total, 0);

  const chartFetchedRef = useRef(false);

  // Fetch weekly chart data ONCE — historical data doesn't change every 5s
  const loadChart = useCallback(async (vehicleIds: string[]) => {
    if (chartFetchedRef.current || vehicleIds.length === 0) return;
    chartFetchedRef.current = true;
    setChartLoading(true);
    try {
      const weeklyResults = await Promise.all(
        vehicleIds.map((id) =>
          fetch(`/api/weekly-summaries?vehicleId=${encodeURIComponent(id)}`)
            .then((r) => r.json())
            .then((j) => (Array.isArray(j) ? (j as DailySummary[]) : []))
            .catch(() => [] as DailySummary[]),
        ),
      );
      const byDate = new Map<string, number>();
      weeklyResults.flat().forEach((s) => {
        byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.total);
      });
      const bars: FleetChartBar[] = Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, total]) => ({ date, total }));
      setChartBars(bars);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Poll fleet stats every 5s — vehicles + today totals only, no weekly fetch
  const pollFleet = useCallback(async () => {
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

      // Load chart once after we know the vehicle IDs
      void loadChart(data.map((row) => row.vehicle.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load fleet");
    }
  }, [loadChart]);

  useEffect(() => {
    void pollFleet();
    const interval = setInterval(() => void pollFleet(), 5000);
    return () => clearInterval(interval);
  }, [pollFleet]);

  return (
    <>
      <header className="rounded-b-[32px] bg-[#1E7A4A] px-5 pb-7 pt-5 shadow-[0_12px_40px_rgba(30,122,74,0.35)] md:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-wide text-white">
            MateCheck
          </Link>
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
            {dateLabel}
          </span>
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Owner · Fleet overview
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-white">Your vehicles</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          Live totals for Accra today. Chart below sums every vehicle; open one for its own 7-day view.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Vehicles</p>
            <p className="mt-1 text-xl font-bold text-white">{items.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Trips</p>
            <p className="mt-1 text-xl font-bold text-white">{totalTrips}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Revenue</p>
            <p className="mt-1 text-lg font-bold leading-tight text-white">
              GHS {totalRevenue.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white/90">
            {onTrackCount} on track
          </span>
          <span className="rounded-full bg-red-500/25 px-3 py-1 text-[11px] font-semibold text-white">
            {anomalyCount} need review
          </span>
        </div>
      </header>

      <div className="px-4 pt-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-5">
            {error ? (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}

            {items.length === 0 && !error ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600 shadow-sm">
                No vehicles loaded yet. Run{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">GET /api/init</code> if the
                database is empty.
              </div>
            ) : null}

            {items.length > 0 ? (
              <FleetRevenueChart
                bars={chartBars}
                todayLabel={dateLabel}
                vehicleCount={items.length}
                loading={chartLoading}
              />
            ) : null}

            <OwnerSection
              id="fleet-list"
              title="Fleet list"
              subtitle="Registered plates and today’s performance. Tap a vehicle for detail, 7-day chart, and AI tools."
            >
              <ul className="grid gap-3 md:grid-cols-2 md:gap-4" aria-label="Vehicles">
                {items.map((row) => (
                  <li key={row.vehicle.id}>
                    <VehicleCard vehicle={row.vehicle} summary={row.summary} />
                  </li>
                ))}
              </ul>
            </OwnerSection>
          </div>

          <aside className="mt-8 hidden lg:sticky lg:top-24 lg:block lg:h-fit lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-5 lg:shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Today overview
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">GHS {totalRevenue.toFixed(2)}</p>
            <p className="mt-1 text-sm text-slate-600">
              {totalTrips} trips · {items.length} vehicles · refreshes every few seconds
            </p>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Fleet chart aggregates every vehicle; vehicle pages show one plate only.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
