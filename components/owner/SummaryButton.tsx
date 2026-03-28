"use client";

import { useState } from "react";
import type { SummaryResponse } from "@/lib/contracts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Props = {
  vehicleId: string;
  date: string;
};

export default function SummaryButton({ vehicleId, date }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vehicleId, date }),
      });

      const data = (await response.json()) as SummaryResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not fetch AI summary");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          AI briefing
        </h3>
        <p className="mt-1 text-sm font-semibold text-slate-800">Daily summary · Twi & English</p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border-2 border-[#1E7A4A] bg-white text-[15px] font-bold text-[#1E7A4A] transition hover:bg-[#1E7A4A]/5 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Get AI summary"}
      </button>

      {loading ? <LoadingSpinner label="Generating summary..." /> : null}

      {error ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-4 rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Twi</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.aiNoteTwi}</p>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">English</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.aiNoteEn}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
