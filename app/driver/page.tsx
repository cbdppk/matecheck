"use client";

import { useState, useEffect } from "react";
import SpeakFieldButton from "@/components/driver/SpeakFieldButton";
import TripCard from "@/components/TripCard";
import {
  sampleVehicles,
  getTripsForVehicleDate,
  todayAccra,
} from "@/lib/sampleData";
import type { Trip, VoiceLogResponse } from "@/lib/contracts";

const vehicle = sampleVehicles[0]!;

// ── pipeline step helpers ─────────────────────────────────────────────────────
type StepStatus = "idle" | "loading" | "done" | "error";
type Step = { label: string; status: StepStatus; detail?: string };

const INITIAL_STEPS: Step[] = [
  { label: "Save trip",        status: "idle" },
  { label: "Twi confirmation", status: "idle" },
];

const stepDot: Record<StepStatus, string> = {
  idle:    "bg-slate-300",
  loading: "bg-blue-400 animate-pulse",
  done:    "bg-emerald-500",
  error:   "bg-red-500",
};
const stepBg: Record<StepStatus, string> = {
  idle:    "border-slate-100 bg-slate-50/60",
  loading: "border-blue-200 bg-blue-50",
  done:    "border-emerald-200 bg-emerald-50",
  error:   "border-red-200 bg-red-50",
};

// ── modal state machine ───────────────────────────────────────────────────────
type ModalState = "closed" | "confirm" | "processing" | "success" | "error";

export default function DriverPage() {
  // trip list — starts from sample data, grows when trips are saved
  const [trips, setTrips] = useState<Trip[]>(() =>
    getTripsForVehicleDate(vehicle.id, todayAccra),
  );
  const totalToday = trips.reduce((s, t) => s + t.amount, 0);

  // form values
  const [route,  setRoute]  = useState("");
  const [amount, setAmount] = useState("");
  const [voiceError, setVoiceError] = useState("");

  // modal
  const [modal,      setModal]      = useState<ModalState>("closed");
  const [modalError, setModalError] = useState("");
  const [steps,      setSteps]      = useState<Step[]>(INITIAL_STEPS);

  // profile sheet
  const [profileOpen, setProfileOpen] = useState(false);

  const parsedAmount = amount !== "" ? Number(amount) : NaN;
  const readyToLog   = route.trim().length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  // auto-close success modal
  useEffect(() => {
    if (modal === "success") {
      const t = setTimeout(() => {
        setModal("closed");
        setRoute("");
        setAmount("");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [modal]);

  function setStep(i: number, patch: Partial<Step>) {
    setSteps(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  async function confirmAndSave() {
    setModal("processing");
    setSteps(INITIAL_STEPS);
    setStep(0, { status: "loading" });

    try {
      const res  = await fetch("/api/voice-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          rawText:   `${route.trim()} ${parsedAmount} cedis`,
          amount:    parsedAmount,
          route:     route.trim(),
        }),
      });
      const data = (await res.json()) as VoiceLogResponse;

      if (!res.ok || !data.success) {
        setStep(0, { status: "error", detail: data.error });
        throw new Error(data.error ?? "Could not log trip");
      }

      setStep(0, { status: "done", detail: `GHS ${data.trip?.amount.toFixed(2)} · ${data.trip?.route}` });
      if (data.trip) setTrips(prev => [data.trip!, ...prev]);

      setStep(1, { status: "loading" });
      if (data.confirmationTwi) {
        try {
          await new Audio(data.confirmationTwi).play();
          setStep(1, { status: "done", detail: "Played" });
        } catch {
          setStep(1, { status: "done", detail: "Ready (autoplay blocked)" });
        }
      } else {
        setStep(1, { status: "done", detail: "—" });
      }

      setModal("success");
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Could not save trip");
      setModal("error");
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* ═══════════════════════════════════════════════════
          HEADER — stats only, no mic buttons
          ═══════════════════════════════════════════════════ */}
      <div className="bg-[#1A6B41] px-5 pt-safe-5 pb-6">

        {/* Top row: brand + profile button */}
        <div className="flex items-center justify-between mb-4 pt-5">
          <div>
            <p className="text-[13px] font-bold text-white/90 tracking-widest uppercase">MateCheck</p>
            <p className="text-[11px] text-white/50 mt-0.5">{vehicle.plate} · {vehicle.route}</p>
          </div>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/50 mb-1">
              Today&apos;s Total
            </p>
            <p className="text-[42px] font-bold text-white leading-none tracking-tight">
              GHS {totalToday.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3 mb-1">
            <div className="text-center">
              <p className="text-[28px] font-bold text-white leading-none">{trips.length}</p>
              <p className="text-[10px] text-white/50 mt-0.5">trips</p>
            </div>
            <div className="text-center">
              <p className="text-[28px] font-bold text-white leading-none">
                {trips.length > 0 ? (totalToday / trips.length).toFixed(0) : "—"}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">avg</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          LOG A TRIP — two voice field columns
          ═══════════════════════════════════════════════════ */}
      <div className="px-4 pt-5">
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">

          {/* Card header */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[15px] font-bold text-slate-900">Log a Trip</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Speak or type the route and sales amount</p>
          </div>

          {/* Two mic + input columns */}
          <div className="grid grid-cols-2 divide-x divide-slate-100">

            {/* Route column */}
            <div className="flex flex-col items-center px-4 pt-5 pb-5 gap-0">
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                Route
              </p>
              <SpeakFieldButton
                field="route"
                value={route}
                onValueChange={(v) => { setRoute(v); setVoiceError(""); }}
                onError={(msg) => setVoiceError(msg)}
              />
            </div>

            {/* Amount column */}
            <div className="flex flex-col items-center px-4 pt-5 pb-5 gap-0">
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                Sales (GHS)
              </p>
              <SpeakFieldButton
                field="amount"
                value={amount}
                onValueChange={(v) => { setAmount(v); setVoiceError(""); }}
                onError={(msg) => setVoiceError(msg)}
              />
            </div>
          </div>

          {/* Error banner */}
          {voiceError ? (
            <div className="mx-4 mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-xs text-red-700">{voiceError}</p>
              <button type="button" onClick={() => setVoiceError("")}
                className="ml-auto text-red-400 hover:text-red-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          ) : null}

          {/* Log Trip button */}
          <div className="px-4 pb-5">
            <button
              type="button"
              onClick={() => { if (readyToLog) setModal("confirm"); }}
              disabled={!readyToLog}
              className={[
                "w-full rounded-2xl py-4 text-[15px] font-bold transition-all min-h-[56px]",
                "flex items-center justify-center gap-2",
                readyToLog
                  ? "bg-[#1A6B41] text-white shadow-[0_6px_20px_rgba(26,107,65,0.32)] active:bg-[#155C37] active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed",
              ].join(" ")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Log Trip
            </button>

            {!readyToLog ? (
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Fill both route and amount above to continue
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          TRIP HISTORY
          ═══════════════════════════════════════════════════ */}
      <div className="px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
            Today&apos;s Trips
          </p>
          <p className="text-[11px] text-slate-400">{trips.length} logged</p>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#CBD5E1" aria-hidden="true">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            <p className="text-sm text-slate-400">No trips logged yet today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...trips]
              .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
              .map((trip) => (
                <TripCard key={trip.id} trip={trip} variant="mobile" />
              ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          BOTTOM NAV — Trips + Profile only (no Owner)
          ═══════════════════════════════════════════════════ */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 shadow-[0_-2px_16px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-center justify-around px-8 h-16">

          {/* Trips — active */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-0.5 rounded-full bg-[#1A6B41] mb-0.5" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1A6B41" aria-hidden="true">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            <span className="text-[10px] font-bold text-[#1A6B41]">Trips</span>
          </div>

          {/* Profile */}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center gap-1 active:opacity-70"
            aria-label="Profile"
          >
            <div className="w-6 h-0.5 rounded-full bg-transparent mb-0.5" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-[10px] font-medium text-slate-400">Profile</span>
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          LOG TRIP MODAL
          ═══════════════════════════════════════════════════ */}
      {modal !== "closed" ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop — only dismissible when not processing */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={modal === "processing" ? undefined : () => setModal("closed")}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-[28px] w-full max-w-md px-5 pt-5 pb-10 z-10">
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

            {/* ── Confirm state ─────────────────────────────── */}
            {modal === "confirm" ? (
              <>
                <p className="text-[17px] font-bold text-slate-900 mb-1">Confirm Trip</p>
                <p className="text-sm text-slate-500 mb-5">
                  Check the details before logging
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="text-sm text-slate-500">Route</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 text-right max-w-[55%] truncate">
                      {route}
                    </span>
                  </div>

                  <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#94A3B8" aria-hidden="true">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                      </svg>
                      <span className="text-sm text-slate-500">Trip Sales</span>
                    </div>
                    <span className="text-[17px] font-bold text-[#1A6B41]">
                      GHS {parsedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModal("closed")}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-[14px] font-semibold text-slate-600 active:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmAndSave()}
                    className="flex-[2] rounded-2xl bg-[#1A6B41] py-4 text-[14px] font-bold text-white active:bg-[#155C37] shadow-[0_4px_14px_rgba(26,107,65,0.3)]"
                  >
                    Log It
                  </button>
                </div>
              </>
            ) : null}

            {/* ── Processing state ──────────────────────────── */}
            {modal === "processing" ? (
              <>
                <p className="text-[17px] font-bold text-slate-900 mb-1">Logging Trip…</p>
                <p className="text-sm text-slate-400 mb-5">Please wait</p>

                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${stepBg[step.status]}`}
                    >
                      {step.status === "loading" ? (
                        <svg className="animate-spin flex-shrink-0" width="14" height="14"
                          viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${stepDot[step.status]}`} />
                      )}
                      <span className="text-sm font-medium text-slate-700">{step.label}</span>
                      {step.status === "loading" ? (
                        <span className="ml-auto text-xs text-blue-500">processing…</span>
                      ) : step.detail ? (
                        <span className="ml-auto text-xs text-slate-400 truncate max-w-[40%]">{step.detail}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {/* ── Success state ─────────────────────────────── */}
            {modal === "success" ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="#1A6B41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[17px] font-bold text-slate-900">Trip Logged!</p>
                  <p className="text-sm text-slate-400 mt-1">Added to today&apos;s records</p>
                </div>
              </div>
            ) : null}

            {/* ── Error state ───────────────────────────────── */}
            {modal === "error" ? (
              <>
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#EF4444" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <p className="text-[17px] font-bold text-red-700 mb-1">Could not save</p>
                <p className="text-sm text-slate-500 mb-5">{modalError}</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModal("closed")}
                    className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-semibold text-slate-700">
                    Close
                  </button>
                  <button type="button" onClick={() => void confirmAndSave()}
                    className="flex-1 rounded-2xl bg-[#1A6B41] py-4 text-sm font-bold text-white">
                    Retry
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════
          PROFILE SHEET
          ═══════════════════════════════════════════════════ */}
      {profileOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProfileOpen(false)} />

          <div className="relative bg-white rounded-t-[28px] px-5 pt-5 pb-10 z-10">
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-4">
              Driver Profile
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#1A6B41] flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{vehicle.ownerName}</p>
                <p className="text-sm text-slate-500">{vehicle.plate}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-3.5">
                <span className="text-sm text-slate-500">Route</span>
                <span className="text-sm font-semibold text-slate-900">{vehicle.route}</span>
              </div>
              <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-3.5">
                <span className="text-sm text-slate-500">Today&apos;s total</span>
                <span className="text-sm font-bold text-[#1A6B41]">GHS {totalToday.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center rounded-2xl bg-slate-50 px-4 py-3.5">
                <span className="text-sm text-slate-500">Trips today</span>
                <span className="text-sm font-bold text-slate-900">{trips.length}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfileOpen(false)}
              className="mt-5 w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-700 active:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
