"use client";

import { useMemo, useState } from "react";
import SpeakFieldButton from "@/components/driver/SpeakFieldButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { sampleVehicles } from "@/lib/sampleData";
import type { VoiceLogResponse } from "@/lib/contracts";

type StepStatus = "idle" | "loading" | "done" | "error";

type PipelineStep = {
  label: string;
  status: StepStatus;
  detail?: string;
};

type PendingTrip = {
  route: string;
  amount: number;
  rawText: string;
};

const IDLE_STEPS: PipelineStep[] = [
  { label: "Save trip", status: "idle" },
  { label: "Twi confirmation", status: "idle" },
];

const statusDot: Record<StepStatus, string> = {
  idle: "bg-gray-300",
  loading: "bg-blue-400 animate-pulse",
  done: "bg-green-400",
  error: "bg-red-400",
};

export default function DriverPage() {
  const [vehicleId, setVehicleId] = useState(sampleVehicles[0]?.id ?? "");
  const [route, setRoute] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<VoiceLogResponse | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(IDLE_STEPS);
  const [pendingTrip, setPendingTrip] = useState<PendingTrip | null>(null);

  const selectedVehicle = useMemo(
    () => sampleVehicles.find((v) => v.id === vehicleId),
    [vehicleId],
  );

  const parsedAmount = amount !== "" ? Number(amount) : NaN;
  const readyToLog = route.trim().length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  function updateStep(index: number, patch: Partial<PipelineStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function saveTrip(trip: PendingTrip) {
    setPendingTrip(null);
    setLoading(true);
    setError("");
    setSuccess(null);
    setSteps(IDLE_STEPS);

    updateStep(0, { status: "loading" });

    try {
      const response = await fetch("/api/voice-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          rawText: trip.rawText,
          amount: trip.amount,
          route: trip.route,
        }),
      });

      const data = (await response.json()) as VoiceLogResponse;

      if (!response.ok || !data.success) {
        updateStep(0, { status: "error", detail: data.error });
        throw new Error(data.error || "Could not log trip");
      }

      updateStep(0, {
        status: "done",
        detail: `GHS ${data.trip?.amount.toFixed(2)} · ${data.trip?.route}`,
      });

      // ── TTS confirmation ──────────────────────────────────────
      updateStep(1, { status: "loading" });
      if (data.confirmationTwi) {
        try {
          const audio = new Audio(data.confirmationTwi);
          await audio.play();
          updateStep(1, { status: "done", detail: "Audio played" });
        } catch {
          updateStep(1, { status: "done", detail: "Audio ready (autoplay blocked)" });
        }
      } else {
        updateStep(1, { status: "done", detail: "No audio (TTS key not configured)" });
      }

      setSuccess(data);
      setRoute("");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log trip");
    } finally {
      setLoading(false);
    }
  }

  function handleLogTrip() {
    if (!readyToLog) return;
    void saveTrip({ route: route.trim(), amount: parsedAmount, rawText: `${route} ${amount} cedis` });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleLogTrip();
  }

  function handleEditPending() {
    if (!pendingTrip) return;
    setAmount(String(pendingTrip.amount || ""));
    setRoute(pendingTrip.route ?? "");
    setPendingTrip(null);
    setSteps(IDLE_STEPS);
  }

  const showPipeline = loading || success !== null || pendingTrip !== null;

  return (
    <main className="screen-shell p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Driver</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Log a trip</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Speak or type the route and sales amount after each trip.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {/* Vehicle */}
        <div>
          <label className="label" htmlFor="vehicleId">Vehicle</label>
          <select
            id="vehicleId"
            className="field"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          >
            {sampleVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} · {v.route}
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

        {/* ── Route field ──────────────────────────────────────── */}
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Route</p>

          <SpeakFieldButton
            field="route"
            onResult={(val) => {
              setRoute(val);
              setError("");
            }}
            onError={(msg) => setError(msg)}
          />

          <div className="mt-3">
            <input
              id="route"
              className="field"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="e.g. Santase–Adum"
            />
          </div>

          {route ? (
            <p className="mt-2 text-xs font-medium text-green-700">
              Route set: {route}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">Not set yet</p>
          )}
        </div>

        {/* ── Amount field ─────────────────────────────────────── */}
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Trip sales (GHS)</p>

          <SpeakFieldButton
            field="amount"
            onResult={(val) => {
              setAmount(val);
              setError("");
            }}
            onError={(msg) => setError(msg)}
          />

          <div className="mt-3">
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              className="field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 80"
            />
          </div>

          {amount && !Number.isNaN(parsedAmount) ? (
            <p className="mt-2 text-xs font-medium text-green-700">
              Amount: GHS {parsedAmount}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">Not set yet</p>
          )}
        </div>

        {/* Log button */}
        <button
          type="submit"
          className="primary-btn w-full"
          disabled={loading || !readyToLog}
        >
          {loading ? "Saving..." : "Log Trip"}
        </button>

        {!readyToLog && !loading ? (
          <p className="text-center text-xs text-gray-400">
            Set both route and amount to log the trip
          </p>
        ) : null}

        {loading ? <LoadingSpinner label="Saving trip..." /> : null}

        {/* Pipeline step indicators */}
        {showPipeline ? (
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-2xl border px-4 py-3 transition-colors ${
                  step.status === "idle"    ? "border-gray-100 bg-gray-50" :
                  step.status === "loading" ? "border-blue-100 bg-blue-50" :
                  step.status === "done"    ? "border-green-100 bg-green-50" :
                                             "border-red-100 bg-red-50"
                }`}
              >
                <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${statusDot[step.status]}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{step.label}</p>
                  {step.detail ? (
                    <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
                  ) : null}
                </div>
                {step.status === "loading" ? (
                  <span className="text-xs text-blue-500">processing...</span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {/* Confirm card */}
        {pendingTrip ? (
          <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">Is this correct?</p>
            <div className="mt-3">
              <p className="text-lg font-bold text-gray-900">
                GHS {pendingTrip.amount > 0 ? pendingTrip.amount : "?"}
              </p>
              <p className="text-sm text-gray-700">{pendingTrip.route || "Route unclear"}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void saveTrip(pendingTrip)}
                className="flex-1 rounded-2xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Yes, log it
              </button>
              <button
                type="button"
                onClick={handleEditPending}
                className="flex-1 rounded-2xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          </div>
        ) : null}

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
