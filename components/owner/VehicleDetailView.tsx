"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { DailySummary, Trip, Vehicle } from "@/lib/contracts";
import EarningsBar from "@/components/owner/EarningsBar";
import OwnerSection from "@/components/owner/OwnerSection";
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

  if (!vehicle || !todaySummary) {
    return (
      <>
        <header className="rounded-b-[32px] bg-[#1E7A4A] px-5 pb-6 pt-5 shadow-[0_12px_40px_rgba(30,122,74,0.35)]">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/90"
          >
            <span aria-hidden>←</span> Fleet list
          </Link>
          <h1 className="mt-4 text-xl font-bold text-white">Vehicle</h1>
        </header>
        <div className="px-4 pt-6">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : (
            <p className="text-sm text-slate-600">Loading vehicle…</p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="rounded-b-[32px] bg-[#1E7A4A] px-5 pb-7 pt-5 shadow-[0_12px_40px_rgba(30,122,74,0.35)]">
        <Link
          href="/owner"
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/90"
        >
          <span aria-hidden>←</span> Fleet list
        </Link>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Vehicle detail
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight text-white">{vehicle.plate}</h1>
        <p className="mt-2 text-sm text-white/80">{vehicle.route}</p>
        <p className="mt-1 text-xs text-white/60">{vehicle.ownerName}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Today · GHS</p>
            <p className="mt-1 text-2xl font-bold text-white">{todaySummary.total.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Trips today</p>
            <p className="mt-1 text-2xl font-bold text-white">{todaySummary.tripCount}</p>
          </div>
        </div>

        {todaySummary.anomaly ? (
          <p className="mt-4 rounded-xl bg-red-500/30 px-3 py-2 text-center text-xs font-semibold text-white">
            Flagged: earnings below recent average — review trips below.
          </p>
        ) : null}
      </header>

      <div className="space-y-6 px-4 pt-6">
        {error ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>
        ) : null}

        <OwnerSection
          title="Performance"
          subtitle="Seven-day bars use Accra calendar days. Polling keeps numbers fresh."
        >
          <EarningsBar summaries={weekly} />
        </OwnerSection>

        <OwnerSection title="AI & disputes" subtitle="Neutral summaries and structured dispute review.">
          <SummaryButton vehicleId={vehicleId} date={tripDate} />
          <Link
            href={`/owner/${vehicleId}/dispute`}
            className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#1E7A4A] text-[15px] font-bold text-white transition active:bg-[#155C37]"
          >
            Open dispute resolver
          </Link>
        </OwnerSection>

        <OwnerSection title="Trip log" subtitle="Chronological entries for the selected Accra date.">
          <TripList trips={trips} listTitle={`Trips · ${tripDate}`} />
        </OwnerSection>
      </div>
    </>
  );
}
