"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SpeakFieldButton from "@/components/driver/SpeakFieldButton";
import type { VoiceLogResponse } from "@/lib/contracts";
import { sampleVehicles } from "@/lib/sampleData";

interface LogTripFormProps {
  variant: "mobile" | "desktop";
}

type StepStatus = "idle" | "loading" | "done" | "error";
type PipelineStep = { label: string; status: StepStatus; detail?: string };
type PendingTrip = { route: string; amount: number };

const IDLE_STEPS: PipelineStep[] = [
  { label: "Save trip", status: "idle" },
  { label: "Twi confirmation", status: "idle" },
];

const stepColors: Record<StepStatus, string> = {
  idle:    "border-slate-100 bg-white",
  loading: "border-blue-100 bg-blue-50",
  done:    "border-green-100 bg-green-50",
  error:   "border-red-100 bg-red-50",
};

const stepDot: Record<StepStatus, string> = {
  idle:    "bg-slate-300",
  loading: "bg-blue-400 animate-pulse",
  done:    "bg-green-500",
  error:   "bg-red-500",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

function parseIsReliable(route: string, amount: number, confidence: string): boolean {
  return confidence === "high" && amount > 0 && Boolean(route) && !route.toLowerCase().includes("unknown");
}

export default function LogTripForm({ variant }: LogTripFormProps) {
  const router = useRouter();
  const vehicle = sampleVehicles[0]!;

  const [route, setRoute] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<PipelineStep[]>(IDLE_STEPS);
  const [pendingTrip, setPendingTrip] = useState<PendingTrip | null>(null);
  const [success, setSuccess] = useState(false);

  const parsedAmount = amount !== "" ? Number(amount) : NaN;
  const readyToLog = route.trim().length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  function updateStep(index: number, patch: Partial<PipelineStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function saveTrip(trip: PendingTrip) {
    setPendingTrip(null);
    setLoading(true);
    setError("");
    setSteps(IDLE_STEPS);
    updateStep(0, { status: "loading" });

    try {
      const res = await fetch("/api/voice-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          rawText: `${trip.route} ${trip.amount} cedis`,
          amount: trip.amount,
          route: trip.route,
        }),
      });

      const data = (await res.json()) as VoiceLogResponse;

      if (!res.ok || !data.success) {
        updateStep(0, { status: "error", detail: data.error });
        throw new Error(data.error ?? "Could not log trip");
      }

      updateStep(0, {
        status: "done",
        detail: `GHS ${data.trip?.amount.toFixed(2)} · ${data.trip?.route}`,
      });

      updateStep(1, { status: "loading" });
      if (data.confirmationTwi) {
        try {
          await new Audio(data.confirmationTwi).play();
          updateStep(1, { status: "done", detail: "Audio played" });
        } catch {
          updateStep(1, { status: "done", detail: "Audio ready (autoplay blocked)" });
        }
      } else {
        updateStep(1, { status: "done", detail: "—" });
      }

      setSuccess(true);
      setRoute("");
      setAmount("");
      setTimeout(() => router.push("/driver"), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log trip");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!readyToLog) return;
    await saveTrip({ route: route.trim(), amount: parsedAmount });
  }

  // When both voice fields are ready, check confidence before saving
  async function tryAutoSave(voiceRoute: string, voiceAmount: number) {
    if (!voiceRoute || voiceAmount <= 0) return;
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${voiceRoute} ${voiceAmount} cedis` }),
      });
      const data = (await res.json()) as { confidence?: string; error?: string };
      const confidence = data.confidence ?? "low";
      const trip = { route: voiceRoute, amount: voiceAmount };
      if (parseIsReliable(voiceRoute, voiceAmount, confidence)) {
        await saveTrip(trip);
      } else {
        setPendingTrip(trip);
      }
    } catch {
      setPendingTrip({ route: voiceRoute, amount: voiceAmount });
    }
  }

  const sharedFields = (
    <div className="space-y-4">
      {/* ── Route ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <SectionLabel>Route</SectionLabel>
        <SpeakFieldButton
          field="route"
          onResult={(val) => {
            setRoute(val);
            setError("");
            // If amount already set, try auto-save
            if (amount && !Number.isNaN(Number(amount))) {
              void tryAutoSave(val, Number(amount));
            }
          }}
          onError={(msg) => setError(msg)}
        />
        <input
          type="text"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          placeholder="e.g. Santase–Adum"
          className="mt-3 w-full bg-[#F8FAFC] border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-[#1E7A4A]"
        />
        {route
          ? <p className="mt-1.5 text-xs font-medium text-green-700">{route}</p>
          : <p className="mt-1.5 text-xs text-slate-400">Not set</p>}
      </div>

      {/* ── Amount ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <SectionLabel>Trip sales (GHS)</SectionLabel>
        <SpeakFieldButton
          field="amount"
          onResult={(val) => {
            setAmount(val);
            setError("");
            // If route already set, try auto-save
            if (route.trim()) {
              void tryAutoSave(route.trim(), Number(val));
            }
          }}
          onError={(msg) => setError(msg)}
        />
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 80"
          className="mt-3 w-full bg-[#F8FAFC] border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-[#1E7A4A]"
        />
        {amount && !Number.isNaN(parsedAmount)
          ? <p className="mt-1.5 text-xs font-medium text-green-700">GHS {parsedAmount}</p>
          : <p className="mt-1.5 text-xs text-slate-400">Not set</p>}
      </div>

      {/* ── Pipeline steps ──────────────────────────────────── */}
      {(loading || success || pendingTrip) ? (
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-colors ${stepColors[step.status]}`}>
              <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${stepDot[step.status]}`} />
              <span className="font-medium text-slate-700">{step.label}</span>
              {step.detail ? <span className="ml-auto text-slate-400">{step.detail}</span> : null}
              {step.status === "loading" ? <span className="ml-auto text-blue-500">processing…</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* ── Confirm card ────────────────────────────────────── */}
      {pendingTrip ? (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Is this correct?</p>
          <p className="text-xs text-amber-600 mt-0.5">Not confident — please check before saving.</p>
          <div className="mt-3">
            <p className="text-lg font-bold text-slate-900">GHS {pendingTrip.amount > 0 ? pendingTrip.amount : "?"}</p>
            <p className="text-sm text-slate-700">{pendingTrip.route || "Route unclear"}</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => void saveTrip(pendingTrip)}
              className="flex-1 rounded-xl bg-[#1E7A4A] py-2.5 text-sm font-semibold text-white">
              Yes, log it
            </button>
            <button type="button" onClick={() => {
              setAmount(String(pendingTrip.amount || ""));
              setRoute(pendingTrip.route ?? "");
              setPendingTrip(null);
            }} className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700">
              Edit
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {success ? <p className="text-xs font-medium text-green-700 text-center">Trip logged ✓ — returning…</p> : null}
      {!readyToLog && !loading && !pendingTrip ? (
        <p className="text-center text-xs text-slate-400">Speak or type both route and amount to log</p>
      ) : null}
    </div>
  );

  if (variant === "mobile") {
    return (
      <form onSubmit={handleSubmit} className="relative flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-5 pb-28">
          {sharedFields}
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-[#F8FAFC] border-t border-slate-100">
          <button type="submit" disabled={loading || !readyToLog}
            className="w-full bg-[#1E7A4A] rounded-2xl py-4 text-[15px] font-semibold text-white flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-50 active:bg-[#155C37]">
            {loading ? <><Spinner />Saving…</> : "Log Trip"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6">
        {sharedFields}
      </div>
      <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-end gap-2.5 flex-shrink-0">
        <button type="button" onClick={() => router.push("/driver")}
          className="bg-[#F8FAFC] border border-slate-100 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-slate-500 min-h-[40px]">
          Cancel
        </button>
        <button type="submit" disabled={loading || !readyToLog}
          className="bg-[#1E7A4A] rounded-xl px-7 py-2.5 text-[13px] font-semibold text-white flex items-center gap-2 min-h-[40px] disabled:opacity-50 active:bg-[#155C37]">
          {loading ? <><Spinner />Saving…</> : "Log Trip"}
        </button>
      </div>
    </form>
  );
}
