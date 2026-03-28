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

  if (!vehicle || !todaySummary) {
    return (
      <main className="screen-shell p-5">
        <Link href="/owner" className="text-sm font-semibold text-brand">
          ← Back to fleet
        </Link>
        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : (
          <p className="mt-4 text-sm text-gray-600">Loading vehicle…</p>
        )}
      </main>
    );
  }

  return (
    <main className="screen-shell p-5">
      <Link href="/owner" className="text-sm font-semibold text-brand">
        ← Back to fleet
      </Link>

      {error ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>
      ) : null}

      <div className="mt-4 section-card">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Vehicle</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{vehicle.plate}</h1>
        <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {vehicle.route}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Today</p>
            <p className="mt-2 text-xl font-semibold">GHS {todaySummary.total.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Trips</p>
            <p className="mt-2 text-xl font-semibold">{todaySummary.tripCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <EarningsBar summaries={weekly} />
      </div>

      <div className="mt-4">
        <SummaryButton vehicleId={vehicleId} date={tripDate} />
      </div>

      <div className="mt-4">
        <TripList trips={trips} />
      </div>

      <div className="mt-4">
        <Link href={`/owner/${vehicleId}/dispute`} className="secondary-btn w-full">
          Open Dispute Resolver
        </Link>
      </div>
    </main>
  );
}
