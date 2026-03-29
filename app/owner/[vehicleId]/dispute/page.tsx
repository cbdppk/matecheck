"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import OwnerSection from "@/components/owner/OwnerSection";
import TtsButton from "@/components/TtsButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type DisputeApiResponse = {
  analysisEn: string;
  analysisTwi: string;
  loggedTotal: number;
  claimedTotal: number;
  verdict: "matches" | "gap_explained" | "gap_unexplained";
};

function VerdictBadge({ verdict }: { verdict: DisputeApiResponse["verdict"] }) {
  const map = {
    matches: { cls: "bg-emerald-100 text-emerald-800", label: "Records match ✓" },
    gap_explained: { cls: "bg-amber-100 text-amber-900", label: "Gap — explained" },
    gap_unexplained: { cls: "bg-red-100 text-red-800", label: "Gap — unexplained" },
  };
  const { cls, label } = map[verdict];
  return (
    <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${cls}`}>
      {label}
    </span>
  );
}

function todayAccra(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function DisputePage() {
  const params = useParams<{ vehicleId: string }>();
  const vehicleId = params?.vehicleId ?? "";
  const [plate, setPlate] = useState("");
  const [loggedPreview, setLoggedPreview] = useState<number | null>(null);
  const [ownerClaim, setOwnerClaim] = useState("");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DisputeApiResponse | null>(null);
  const [error, setError] = useState("");

  const loadContext = useCallback(async () => {
    if (!vehicleId) return;
    const date = todayAccra();
    try {
      const [fleetRes, tripsRes] = await Promise.all([
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch(`/api/trips?vehicleId=${encodeURIComponent(vehicleId)}&date=${encodeURIComponent(date)}`, { cache: "no-store" }),
      ]);
      const fleet = (await fleetRes.json()) as { vehicle?: { id: string; plate: string } }[];
      if (fleetRes.ok && Array.isArray(fleet)) {
        const row = fleet.find((item) => item.vehicle?.id === vehicleId);
        if (row?.vehicle?.plate) setPlate(row.vehicle.plate);
      }
      const trips = (await tripsRes.json()) as { amount?: number }[];
      if (tripsRes.ok && Array.isArray(trips)) {
        const total = trips.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        setLoggedPreview(Number(total.toFixed(2)));
      }
    } catch { /* non-blocking */ }
  }, [vehicleId]);

  useEffect(() => { void loadContext(); }, [loadContext]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          date: todayAccra(),
          ownerClaim,
          claimedAmount: claimedAmount ? Number(claimedAmount) : undefined,
        }),
      });

      const data = (await response.json()) as DisputeApiResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Review unavailable right now.");
      }

      setResult(data);
      void loadContext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review couldn't be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const gap = result ? Math.abs(result.claimedTotal - result.loggedTotal) : 0;

  return (
    <>
      <header className="rounded-b-[32px] bg-[#1E7A4A] px-5 pb-7 pt-5 shadow-[0_12px_40px_rgba(30,122,74,0.35)] md:px-8 lg:px-10">
        <Link
          href={`/owner/${vehicleId}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/90"
        >
          <span aria-hidden>←</span> Vehicle detail
        </Link>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Dispute resolution
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Revenue review</h1>
        {plate ? (
          <p className="mt-2 text-sm font-medium text-white/80">{plate} · {todayAccra()}</p>
        ) : null}
        {loggedPreview !== null ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Logged today</span>
            <span className="text-lg font-bold text-white">GHS {loggedPreview.toFixed(2)}</span>
          </div>
        ) : null}
      </header>

      <div className="px-4 pb-8 pt-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-6">

          <OwnerSection
            title="Describe the issue"
            subtitle="Tell us what you expected vs what the records show. Include any amount the driver or ticket book shows."
          >
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400" htmlFor="ownerClaim">
                  What's the discrepancy?
                </label>
                <textarea
                  id="ownerClaim"
                  className="min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E7A4A]"
                  value={ownerClaim}
                  onChange={(e) => setOwnerClaim(e.target.value)}
                  placeholder="E.g. My ticket book shows GHS 180 but the app only recorded GHS 140."
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400" htmlFor="claimedAmount">
                  Expected amount (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">GHS</span>
                  <input
                    id="claimedAmount"
                    type="number"
                    inputMode="decimal"
                    className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-sm outline-none focus:border-[#1E7A4A]"
                    value={claimedAmount}
                    onChange={(e) => setClaimedAmount(e.target.value)}
                    placeholder="180"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1E7A4A] text-[15px] font-bold text-white transition disabled:opacity-50 active:bg-[#155C37]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                {loading ? "Reviewing…" : "Get AI verdict"}
              </button>

              {loading ? <LoadingSpinner label="AI is reviewing the trip records…" /> : null}

              {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              ) : null}
            </form>
          </OwnerSection>

          {result ? (
            <div className="space-y-4">
              {/* Verdict header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  AI verdict
                </p>
                <VerdictBadge verdict={result.verdict} />

                {/* Numbers breakdown */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Logged</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">GHS {result.loggedTotal.toFixed(0)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Claimed</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">GHS {result.claimedTotal.toFixed(0)}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${gap <= 5 ? "bg-emerald-50" : gap <= 15 ? "bg-amber-50" : "bg-red-50"}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${gap <= 5 ? "text-emerald-600" : gap <= 15 ? "text-amber-700" : "text-red-600"}`}>
                      Gap
                    </p>
                    <p className={`mt-1 text-lg font-bold ${gap <= 5 ? "text-emerald-800" : gap <= 15 ? "text-amber-900" : "text-red-800"}`}>
                      GHS {gap.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">English</p>
                  <p className="text-sm leading-relaxed text-slate-800">{result.analysisEn}</p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Twi</p>
                    <TtsButton text={result.analysisTwi} />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800">{result.analysisTwi}</p>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </>
  );
}
