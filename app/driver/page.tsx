"use client";

import { useState } from "react";
import Link from "next/link";
import SpeakFieldButton from "@/components/driver/SpeakFieldButton";
import TripCard from "@/components/TripCard";
import {
  sampleVehicles,
  getTripsForVehicleDate,
  todayAccra,
} from "@/lib/sampleData";
import type { Trip, VoiceLogResponse } from "@/lib/contracts";

const vehicle = sampleVehicles[0]!;

type StepStatus = "idle" | "loading" | "done" | "error";
type PipelineStep = { label: string; status: StepStatus; detail?: string };
type PendingTrip  = { route: string; amount: number };

const IDLE_STEPS: PipelineStep[] = [
  { label: "Save trip",          status: "idle" },
  { label: "Twi confirmation",   status: "idle" },
];

const stepDot: Record<StepStatus, string> = {
  idle:    "bg-slate-300",
  loading: "bg-blue-400 animate-pulse",
  done:    "bg-green-500",
  error:   "bg-red-500",
};
const stepBg: Record<StepStatus, string> = {
  idle:    "border-slate-100 bg-white/60",
  loading: "border-blue-200 bg-blue-50",
  done:    "border-green-200 bg-green-50",
  error:   "border-red-200 bg-red-50",
};

function parseIsReliable(route: string, amount: number, confidence: string) {
  return confidence === "high" && amount > 0 && Boolean(route) && !route.toLowerCase().includes("unknown");
}

export default function DriverPage() {
  /* ── trip list (starts from sample data, grows as trips are saved) ── */
  const [trips, setTrips] = useState<Trip[]>(() =>
    getTripsForVehicleDate(vehicle.id, todayAccra),
  );

  const totalToday = trips.reduce((s, t) => s + t.amount, 0);

  /* ── log form state ── */
  const [route,  setRoute]  = useState("");
  const [amount, setAmount] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [steps,    setSteps]    = useState<PipelineStep[]>(IDLE_STEPS);
  const [pending,  setPending]  = useState<PendingTrip | null>(null);
  const [saved,    setSaved]    = useState(false);

  /* ── profile sheet ── */
  const [profileOpen, setProfileOpen] = useState(false);

  const parsedAmount = amount !== "" ? Number(amount) : NaN;
  const readyToLog   = route.trim().length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  function updateStep(i: number, patch: Partial<PipelineStep>) {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  async function saveTrip(trip: PendingTrip) {
    setPending(null);
    setLoading(true);
    setError("");
    setSaved(false);
    setSteps(IDLE_STEPS);
    updateStep(0, { status: "loading" });

    try {
      const res  = await fetch("/api/voice-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          rawText:   `${trip.route} ${trip.amount} cedis`,
          amount:    trip.amount,
          route:     trip.route,
        }),
      });
      const data = (await res.json()) as VoiceLogResponse;
      if (!res.ok || !data.success) {
        updateStep(0, { status: "error", detail: data.error });
        throw new Error(data.error ?? "Could not log trip");
      }

      updateStep(0, { status: "done", detail: `GHS ${data.trip?.amount.toFixed(2)} · ${data.trip?.route}` });

      /* add to local trip list so feed updates immediately */
      if (data.trip) setTrips(prev => [data.trip!, ...prev]);

      updateStep(1, { status: "loading" });
      if (data.confirmationTwi) {
        try { await new Audio(data.confirmationTwi).play(); updateStep(1, { status: "done", detail: "Played" }); }
        catch { updateStep(1, { status: "done", detail: "Ready (autoplay blocked)" }); }
      } else {
        updateStep(1, { status: "done", detail: "—" });
      }

      setSaved(true);
      setRoute("");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log trip");
    } finally {
      setLoading(false);
    }
  }

  async function tryAutoSave(r: string, a: number) {
    if (!r || a <= 0) return;
    try {
      const res  = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${r} ${a} cedis` }),
      });
      const data = (await res.json()) as { confidence?: string };
      if (parseIsReliable(r, a, data.confidence ?? "low")) {
        await saveTrip({ route: r, amount: a });
      } else {
        setPending({ route: r, amount: a });
      }
    } catch {
      setPending({ route: r, amount: a });
    }
  }

  function handleLogTrip() {
    if (!readyToLog) return;
    void saveTrip({ route: route.trim(), amount: parsedAmount });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ════════════════════════════════════════
          GREEN HEADER CARD — stats + mic buttons
          ════════════════════════════════════════ */}
      <div className="bg-[#1E7A4A] rounded-b-[32px] px-5 pt-5 pb-6 shadow-[0_12px_40px_rgba(30,122,74,0.35)]">

        {/* Row 1: brand + profile */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-bold text-white tracking-wide">MateCheck</span>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </div>

        {/* Row 2: today's total + trip count */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-1">
              Today&apos;s Total
            </p>
            <p className="text-[46px] font-bold text-white leading-none tracking-tight">
              GHS {totalToday.toFixed(2)}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {vehicle.plate} · {vehicle.route}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[32px] font-bold text-white leading-none">{trips.length}</p>
            <p className="text-xs text-white/60 mt-1">trips</p>
          </div>
        </div>

        {/* Row 3: TWO big mic buttons */}
        <div className="grid grid-cols-2 gap-3">
          <SpeakFieldButton
            field="route"
            onResult={(val) => {
              setRoute(val);
              setError("");
              setSaved(false);
              if (amount && !Number.isNaN(Number(amount))) {
                void tryAutoSave(val, Number(amount));
              }
            }}
            onError={(msg) => setError(msg)}
          />
          <SpeakFieldButton
            field="amount"
            onResult={(val) => {
              setAmount(val);
              setError("");
              setSaved(false);
              if (route.trim()) {
                void tryAutoSave(route.trim(), Number(val));
              }
            }}
            onError={(msg) => setError(msg)}
          />
        </div>
      </div>

      {/* ════════════════════════════════════
          LOG FORM — fields + button
          ════════════════════════════════════ */}
      <div className="px-4 pt-4 pb-2 space-y-3">

        {/* Route + Amount fields side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5">Route</p>
            <input
              type="text"
              value={route}
              onChange={(e) => { setRoute(e.target.value); setSaved(false); }}
              placeholder="e.g. Santase–Adum"
              className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-[#1E7A4A]"
            />
            {route
              ? <p className="mt-1 text-[11px] font-medium text-green-700 truncate">{route}</p>
              : <p className="mt-1 text-[11px] text-slate-400">Not set</p>}
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5">
              Trip Sales (GHS)
            </p>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setSaved(false); }}
              placeholder="e.g. 80"
              className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-[#1E7A4A]"
            />
            {amount && !Number.isNaN(parsedAmount)
              ? <p className="mt-1 text-[11px] font-medium text-green-700">GHS {parsedAmount}</p>
              : <p className="mt-1 text-[11px] text-slate-400">Not set</p>}
          </div>
        </div>

        {/* Log Trip button */}
        <button
          type="button"
          onClick={handleLogTrip}
          disabled={loading || !readyToLog}
          className="w-full bg-[#1E7A4A] rounded-2xl py-4 text-[15px] font-bold text-white flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-40 active:bg-[#155C37] transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Saving…
            </>
          ) : "Log Trip"}
        </button>

        {!readyToLog && !loading ? (
          <p className="text-center text-xs text-slate-400">
            Speak or type both route and amount above
          </p>
        ) : null}

        {/* Pipeline steps */}
        {(loading || saved || pending) ? (
          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-colors ${stepBg[step.status]}`}>
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${stepDot[step.status]}`} />
                <span className="font-medium text-slate-700">{step.label}</span>
                {step.detail ? <span className="ml-auto text-slate-400">{step.detail}</span> : null}
                {step.status === "loading" ? <span className="ml-auto text-blue-500">processing…</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        {/* Confirm card */}
        {pending ? (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">Is this right?</p>
            <p className="text-xs text-amber-600 mt-0.5">Couldn&apos;t confirm automatically — please check.</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900">GHS {pending.amount > 0 ? pending.amount : "?"}</p>
                <p className="text-sm text-slate-700">{pending.route || "Route unclear"}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void saveTrip(pending)}
                className="flex-1 rounded-xl bg-[#1E7A4A] py-3 text-sm font-bold text-white active:bg-[#155C37]">
                Yes, log it
              </button>
              <button type="button" onClick={() => {
                setAmount(String(pending.amount || ""));
                setRoute(pending.route ?? "");
                setPending(null);
              }} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700">
                Edit
              </button>
            </div>
          </div>
        ) : null}

        {saved ? (
          <p className="text-center text-sm font-semibold text-green-700">Trip logged ✓</p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}
      </div>

      {/* ════════════════════════════════════
          TRIP HISTORY
          ════════════════════════════════════ */}
      <div className="px-4 pt-4 pb-28">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3 px-1">
          Today&apos;s Trips
        </p>

        {trips.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No trips logged yet today.</p>
        ) : (
          [...trips]
            .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
            .map((trip) => <TripCard key={trip.id} trip={trip} variant="mobile" />)
        )}
      </div>

      {/* ════════════════════════════════════
          BOTTOM NAV
          ════════════════════════════════════ */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe px-6 h-16"
      >
        {/* Trips — active */}
        <Link href="/driver" aria-label="Trips"
          className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1E7A4A" aria-hidden="true">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
          <span className="text-[10px] font-semibold text-[#1E7A4A]">Trips</span>
        </Link>

        {/* Owner dashboard */}
        <Link href="/owner" aria-label="Owner dashboard"
          className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
            <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h11v2H3v-2zm0 4h11v2H3v-2zm13-1l5 5-5 5v-3h-4v-4h4v-3z" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-400">Owner</span>
        </Link>

        {/* Profile */}
        <button type="button" onClick={() => setProfileOpen(true)} aria-label="Profile"
          className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-400">Profile</span>
        </button>
      </nav>

      {/* ════════════════════════════════════
          PROFILE SHEET
          ════════════════════════════════════ */}
      {profileOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setProfileOpen(false)} />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-[28px] px-5 pt-5 pb-10 z-10">
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-4">
              Driver Profile
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#1E7A4A] flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{vehicle.ownerName}</p>
                <p className="text-sm text-slate-500">{vehicle.plate}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Route</span>
                <span className="text-sm font-semibold text-slate-900">{vehicle.route}</span>
              </div>
              <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Today&apos;s total</span>
                <span className="text-sm font-bold text-[#1E7A4A]">GHS {totalToday.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Trips today</span>
                <span className="text-sm font-bold text-slate-900">{trips.length}</span>
              </div>
            </div>

            <Link href="/owner"
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700">
              View Owner Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748B" aria-hidden="true">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
