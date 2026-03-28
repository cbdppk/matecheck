"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MicButton from "@/components/MicButton";
import type { VoiceLogResponse } from "@/lib/contracts";
import { sampleVehicles } from "@/lib/sampleData";

interface LogTripFormProps {
  variant: "mobile" | "desktop";
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2.5 my-4">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[11px] text-slate-400 font-medium">or type manually</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

export default function LogTripForm({ variant }: LogTripFormProps) {
  const router = useRouter();
  const vehicle = sampleVehicles[0]!;

  const [rawText, setRawText] = useState("");
  const [amount, setAmount] = useState("");
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [micError, setMicError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/voice-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          rawText: rawText || undefined,
          amount: amount ? Number(amount) : undefined,
          route: route || undefined,
        }),
      });

      const data = (await res.json()) as VoiceLogResponse;

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Could not log trip");
      }

      router.push("/driver");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log trip");
    } finally {
      setLoading(false);
    }
  }

  const sharedFields = (
    <>
      {micError ? <p className="text-xs text-red-500 mb-2">{micError}</p> : null}

      <SectionLabel>Voice Input</SectionLabel>
      <MicButton
        variant={variant}
        onResult={(text) => {
          setRawText(text);
          setMicError("");
        }}
        onError={setMicError}
      />

      <Divider />

      <SectionLabel>Type Trip Details</SectionLabel>
      <textarea
        rows={variant === "desktop" ? 2 : 3}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="E.g. Circle to Madina, 20 cedis"
        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-[#1E7A4A] resize-none"
      />

      <div className={`flex mt-3 ${variant === "desktop" ? "gap-3" : "gap-2.5"}`}>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Amount (GHS)</p>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="20"
            className="bg-white border border-slate-100 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#1E7A4A] w-full min-h-[48px]"
          />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Route</p>
          <input
            type="text"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="Circle–Madina"
            className="bg-white border border-slate-100 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-[#1E7A4A] w-full min-h-[48px]"
          />
        </div>
      </div>

      {error ? <p className="text-xs text-red-500 mt-2">{error}</p> : null}
    </>
  );

  if (variant === "mobile") {
    return (
      <form onSubmit={handleSubmit} className="relative flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-5 pb-28">
          {sharedFields}
        </div>

        {/* Pinned submit button */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-[#F8FAFC] border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E7A4A] rounded-2xl py-4 text-[15px] font-semibold text-white active:bg-[#155C37] transition-colors flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Spinner />
                Logging…
              </>
            ) : (
              "Log Trip"
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 flex flex-col gap-1">
        {sharedFields}
      </div>

      {/* Desktop footer */}
      <div className="bg-white border-t border-slate-100 px-6 py-3.5 flex justify-end gap-2.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push("/driver")}
          className="bg-[#F8FAFC] border border-slate-100 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-slate-500 cursor-pointer min-h-[40px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1E7A4A] rounded-xl px-7 py-2.5 text-[13px] font-semibold text-white cursor-pointer active:bg-[#155C37] flex items-center gap-2 min-h-[40px] disabled:opacity-70"
        >
          {loading ? (
            <>
              <Spinner />
              Logging…
            </>
          ) : (
            "Log Trip"
          )}
        </button>
      </div>
    </form>
  );
}
