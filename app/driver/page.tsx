"use client";

import { useMemo, useState } from "react";
import VoiceLogButton from "@/components/driver/VoiceLogButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { sampleVehicles } from "@/lib/sampleData";
import type { VoiceLogResponse } from "@/lib/contracts";

export default function DriverPage() {
  const [vehicleId, setVehicleId] = useState(sampleVehicles[0]?.id ?? "");
  const [rawText, setRawText] = useState("");
  const [amount, setAmount] = useState("");
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<VoiceLogResponse | null>(null);

  const selectedVehicle = useMemo(
    () => sampleVehicles.find((vehicle) => vehicle.id === vehicleId),
    [vehicleId],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await fetch("/api/voice-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          rawText,
          amount: amount ? Number(amount) : undefined,
          route: route || undefined,
        }),
      });

      const data = (await response.json()) as VoiceLogResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not log trip");
      }

      setSuccess(data);
      setRawText("");
      setAmount("");
      setRoute("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-shell p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Driver</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Log a trip</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Speak the route and amount in Twi, or type it manually.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="vehicleId">Vehicle</label>
          <select
            id="vehicleId"
            className="field"
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
          >
            {sampleVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} · {vehicle.route}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicle ? (
          <div className="section-card">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Default route</p>
            <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {selectedVehicle.route}
            </p>
          </div>
        ) : null}

        <VoiceLogButton
          onResult={(text) => {
            setRawText(text);
            setError("");
          }}
          onError={(message) => setError(message)}
        />

        <div>
          <label className="label" htmlFor="rawText">Or type trip details</label>
          <textarea
            id="rawText"
            className="field min-h-28 resize-none"
            placeholder="Example: Circle to Madina, 20 cedis"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="amount">Manual amount (GHS)</label>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              className="field"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="20"
            />
          </div>

          <div>
            <label className="label" htmlFor="route">Manual route</label>
            <input
              id="route"
              className="field"
              value={route}
              onChange={(event) => setRoute(event.target.value)}
              placeholder="Circle–Madina"
            />
          </div>
        </div>

        <button type="submit" className="primary-btn w-full" disabled={loading}>
          {loading ? "Logging..." : "Log Trip"}
        </button>

        {loading ? <LoadingSpinner label="Saving trip..." /> : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {success?.trip ? (
          <div className="rounded-3xl bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">Trip logged ✓</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              GHS {success.trip.amount.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-gray-700">{success.trip.route}</p>
          </div>
        ) : null}
      </form>
    </main>
  );
}
