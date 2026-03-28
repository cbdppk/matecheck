"use client";

import Link from "next/link";
import { useState } from "react";
import type { SummaryResponse } from "@/lib/contracts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Props = {
  vehicleId: string;
  date: string;
  /** Default: full-width card. Compact: small top actions row (optionally with dispute link). */
  variant?: "default" | "compact";
  /** When set with `compact`, renders a matching Dispute button in the same row. */
  disputeHref?: string;
};

const compactBtn =
  "inline-flex min-h-[40px] flex-1 items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-xs font-bold transition sm:text-sm";

export default function SummaryButton({ vehicleId, date, variant = "default", disputeHref }: Props) {
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

  const resultBlock = (
    <>
      {loading ? <LoadingSpinner label="Generating summary…" /> : null}

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Twi</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.aiNoteTwi}</p>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">English</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.aiNoteEn}</p>
          </div>
        </div>
      ) : null}
    </>
  );

  if (variant === "compact") {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Quick actions
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            AI summary and dispute stay above the trip history.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className={`${compactBtn} border-[#1E7A4A] bg-white text-[#1E7A4A] hover:bg-[#1E7A4A]/5 disabled:opacity-50`}
          >
            AI summary
          </button>
          {disputeHref ? (
            <Link
              href={disputeHref}
              className={`${compactBtn} border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`}
            >
              Dispute
            </Link>
          ) : null}
        </div>

        {resultBlock}
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="secondary-btn w-full disabled:opacity-50"
        >
          Get AI Summary
        </button>

        {resultBlock}
      </div>
    </div>
  );
}
