"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import OwnerSection from "@/components/owner/OwnerSection";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type DisputeApiResponse = {
  analysisEn: string;
  analysisTwi: string;
  loggedTotal: number;
  claimedTotal: number;
  verdict: "matches" | "gap_explained" | "gap_unexplained";
};

function verdictClass(verdict: DisputeApiResponse["verdict"]) {
  if (verdict === "matches") return "bg-emerald-100 text-emerald-800";
  if (verdict === "gap_explained") return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-800";
}

function verdictLabel(verdict: DisputeApiResponse["verdict"]) {
  if (verdict === "matches") return "Match ✓";
  if (verdict === "gap_explained") return "Gap — explained";
  return "Gap — unexplained";
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
    if (!vehicleId) {
      return;
    }

    const date = todayAccra();

    try {
      const [fleetRes, tripsRes] = await Promise.all([
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch(
          `/api/trips?vehicleId=${encodeURIComponent(vehicleId)}&date=${encodeURIComponent(date)}`,
          { cache: "no-store" },
        ),
      ]);

      const fleet = (await fleetRes.json()) as { vehicle?: { id: string; plate: string } }[];
      if (fleetRes.ok && Array.isArray(fleet)) {
        const row = fleet.find((item) => item.vehicle?.id === vehicleId);
        if (row?.vehicle?.plate) {
          setPlate(row.vehicle.plate);
        }
      }

      const trips = (await tripsRes.json()) as { amount?: number }[];
      if (tripsRes.ok && Array.isArray(trips)) {
        const total = trips.reduce((sum, trip) => sum + (Number(trip.amount) || 0), 0);
        setLoggedPreview(Number(total.toFixed(2)));
      }
    } catch {
      /* non-blocking */
    }
  }, [vehicleId]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/dispute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          date: new Intl.DateTimeFormat("en-CA", {
            timeZone: "Africa/Accra",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()),
          ownerClaim,
          claimedAmount: claimedAmount ? Number(claimedAmount) : undefined,
        }),
      });

      const data = (await response.json()) as DisputeApiResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not review dispute");
      }

      setResult(data);
      void loadContext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not review dispute");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="rounded-b-[32px] bg-[#1E7A4A] px-5 pb-7 pt-5 shadow-[0_12px_40px_rgba(30,122,74,0.35)]">
        <Link
          href={`/owner/${vehicleId}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/90"
        >
          <span aria-hidden>←</span> Vehicle detail
        </Link>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Dispute resolution
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">AI revenue review</h1>
        {plate ? (
          <p className="mt-3 text-sm font-medium text-white/90">
            {plate} · {todayAccra()}
          </p>
        ) : null}
        {loggedPreview !== null ? (
          <p className="mt-2 text-lg font-bold text-white">Logged today: GHS {loggedPreview.toFixed(2)}</p>
        ) : null}
      </header>

      <div className="px-4 pb-4 pt-6">
        <OwnerSection
          title="Your claim"
          subtitle="Describe the mismatch in plain language. Optional: enter the amount the driver or records should show."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400" htmlFor="ownerClaim">
                Dispute details
              </label>
              <textarea
                id="ownerClaim"
                className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[#1E7A4A]"
                value={ownerClaim}
                onChange={(event) => setOwnerClaim(event.target.value)}
                placeholder="Example: Driver says 80 cedis but I only see 60 on the dashboard."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400" htmlFor="claimedAmount">
                Claimed amount (optional)
              </label>
              <input
                id="claimedAmount"
                type="number"
                inputMode="decimal"
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1E7A4A]"
                value={claimedAmount}
                onChange={(event) => setClaimedAmount(event.target.value)}
                placeholder="80"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-[#1E7A4A] text-[15px] font-bold text-white transition disabled:opacity-50 active:bg-[#155C37]"
            >
              {loading ? "Reviewing…" : "Get AI verdict"}
            </button>

            {loading ? <LoadingSpinner label="AI is reviewing the records…" /> : null}

            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}
          </form>
        </OwnerSection>

        {result ? (
          <OwnerSection title="Verdict" subtitle="Bilingual analysis based on logged trips and your claim.">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${verdictClass(result.verdict)}`}>
                {verdictLabel(result.verdict)}
              </span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">English</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.analysisEn}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Twi</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.analysisTwi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Logged</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">GHS {result.loggedTotal.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Claimed</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">GHS {result.claimedTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </OwnerSection>
        ) : null}
      </div>
    </>
  );
}
