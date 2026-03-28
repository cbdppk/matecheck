"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { DailySummary, Trip, Vehicle } from "@/lib/contracts";
import EarningsBar from "@/components/owner/EarningsBar";
import SummaryButton from "@/components/owner/SummaryButton";
import TripList from "@/components/owner/TripList";

type FleetRow = { vehicle: Vehicle; summary: DailySummary };

function todayAccra(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type Props = { vehicleId: string };

export default function VehicleDetailView({ vehicleId }: Props) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [weekly, setWeekly] = useState<DailySummary[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");
  const [tripDate, setTripDate] = useState(todayAccra);

  const load = useCallback(async () => {
    const date = todayAccra();
    setTripDate(date);

    try {
      const [fleetRes, weekRes, tripsRes] = await Promise.all([
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch(`/api/weekly-summaries?vehicleId=${encodeURIComponent(vehicleId)}`, {
          cache: "no-store",
        }),
        fetch(
          `/api/trips?vehicleId=${encodeURIComponent(vehicleId)}&date=${encodeURIComponent(date)}`,
          { cache: "no-store" },
        ),
      ]);

      const fleetJson = (await fleetRes.json()) as FleetRow[] | { error?: string };
      if (!fleetRes.ok || !Array.isArray(fleetJson)) {
        throw new Error(
          typeof fleetJson === "object" && fleetJson && "error" in fleetJson
            ? String((fleetJson as { error?: string }).error)
            : "Could not load vehicle",
        );
      }

      const row = fleetJson.find((item) => item.vehicle.id === vehicleId);
      if (!row) {
        setVehicle(null);
        setTodaySummary(null);
        setError("Vehicle not found.");
        return;
      }

      setVehicle(row.vehicle);
      setTodaySummary(row.summary);

      const weekJson = (await weekRes.json()) as DailySummary[] | { error?: string };
      if (!weekRes.ok || !Array.isArray(weekJson)) {
        throw new Error("Could not load weekly trend");
      }
      setWeekly(weekJson);

      const tripsJson = (await tripsRes.json()) as Trip[] | { error?: string };
      if (!tripsRes.ok || !Array.isArray(tripsJson)) {
        throw new Error("Could not load trips");
      }
      setTrips(tripsJson);

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    }
  }, [vehicleId]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => clearInterval(interval);
  }, [load]);

  const BackButton = () => (
    <Link
      href="/owner"
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors active:bg-slate-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748B" aria-hidden="true">
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
      </svg>
      Fleet
    </Link>
  );

  if (!vehicle || !todaySummary) {
    return (
      <div className="px-4 pb-6 pt-4 md:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <BackButton />
          {error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">Loading vehicle…</p>
          )}
        </div>
      </div>
    );
  }

  const disputeHref = `/owner/${vehicleId}/dispute`;

  return (
    <div className="px-4 pb-6 pt-4 md:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton />
        </div>

        {error ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>
        ) : null}

        <div className="section-card">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Vehicle</p>
          <h1 className="mt-2 text-2xl font-bold text-ink md:text-3xl lg:text-4xl">{vehicle.plate}</h1>
          <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {vehicle.route}
          </p>
          <p className="mt-2 text-sm text-slate-500">{vehicle.ownerName}</p>

          {todaySummary.anomaly ? (
            <div className="mt-3">
              <span className="pill bg-red-100 text-red-700">Low earnings</span>
            </div>
          ) : (
            <div className="mt-3">
              <span className="pill bg-emerald-100 text-emerald-700">On track</span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4">
            <div className="rounded-2xl bg-gray-50 p-3 md:min-h-24 md:p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Today</p>
              <p className="mt-2 text-xl font-semibold text-ink md:text-2xl">
                GHS {todaySummary.total.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3 md:min-h-24 md:p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Trips</p>
              <p className="mt-2 text-xl font-semibold text-ink md:text-2xl">{todaySummary.tripCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <SummaryButton
            variant="compact"
            vehicleId={vehicleId}
            date={tripDate}
            disputeHref={disputeHref}
          />
        </div>

        <EarningsBar summaries={weekly} />

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Trip history
          </p>
          <p className="mb-3 text-xs text-slate-500">
            {tripDate} · on desktop, this list scrolls inside a fixed area so actions above stay visible.
          </p>
          <div className="md:max-h-[min(55vh,32rem)] md:overflow-y-auto md:rounded-2xl md:[scrollbar-gutter:stable]">
            <TripList trips={trips} listTitle={`Trips · ${tripDate}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
