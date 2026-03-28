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
    <div className="section-card">
      <div className="flex flex-col gap-3">
        <button type="button" onClick={handleClick} className="secondary-btn w-full">
          Get AI Summary
        </button>

        {loading ? <LoadingSpinner label="Generating summary..." /> : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {result ? (
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Twi</p>
            <p className="mt-1 text-sm leading-6 text-gray-700">{result.aiNoteTwi}</p>

            <p className="mt-4 text-sm font-semibold text-gray-900">English</p>
            <p className="mt-1 text-sm leading-6 text-gray-700">{result.aiNoteEn}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
