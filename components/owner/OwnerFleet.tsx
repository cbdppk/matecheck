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
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Owner</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Your Fleet</h1>
        </div>

        <div className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
          {dateLabel}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {items.map((row) => (
          <VehicleCard key={row.vehicle.id} vehicle={row.vehicle} summary={row.summary} />
        ))}
      </div>
    </>
  );
}
