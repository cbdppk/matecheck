"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type DisputeApiResponse = {
  analysisEn: string;
  analysisTwi: string;
  loggedTotal: number;
  claimedTotal: number;
  verdict: "matches" | "gap_explained" | "gap_unexplained";
};

function verdictClass(verdict: DisputeApiResponse["verdict"]) {
  if (verdict === "matches") return "bg-emerald-100 text-emerald-700";
  if (verdict === "gap_explained") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
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
    <main className="screen-shell p-5">
      <Link href={`/owner/${vehicleId}`} className="text-sm font-semibold text-brand">
        ← Back to vehicle
      </Link>

      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Dispute</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">AI revenue review</h1>
        {plate ? (
          <p className="mt-2 text-sm font-medium text-gray-800">
            Vehicle <span className="font-semibold">{plate}</span> · {todayAccra()}
          </p>
        ) : null}
        {loggedPreview !== null ? (
          <p className="mt-2 text-sm font-semibold text-gray-900">
            Logged today: GHS {loggedPreview.toFixed(2)}
          </p>
        ) : null}
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Describe what the owner believes is missing or mismatched.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="ownerClaim">Describe the dispute</label>
          <textarea
            id="ownerClaim"
            className="field min-h-32 resize-none"
            value={ownerClaim}
            onChange={(event) => setOwnerClaim(event.target.value)}
            placeholder="Driver says he made 80 cedis but I only see 60. / Driver no ka sɛ ɔyɛɛ 80 cedis..."
          />
        </div>

        <div>
          <label className="label" htmlFor="claimedAmount">Claimed amount (optional)</label>
          <input
            id="claimedAmount"
            type="number"
            inputMode="decimal"
            className="field"
            value={claimedAmount}
            onChange={(event) => setClaimedAmount(event.target.value)}
            placeholder="80"
          />
        </div>

        <button type="submit" className="primary-btn w-full" disabled={loading}>
          Get AI Verdict
        </button>

        {loading ? <LoadingSpinner label="AI is reviewing the records..." /> : null}

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {result ? (
          <div className="section-card space-y-4">
            <span className={`pill ${verdictClass(result.verdict)}`}>
              {verdictLabel(result.verdict)}
            </span>

            <div>
              <p className="text-sm font-semibold text-gray-900">English</p>
              <p className="mt-1 text-sm leading-6 text-gray-700">{result.analysisEn}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">Twi</p>
              <p className="mt-1 text-sm leading-6 text-gray-700">{result.analysisTwi}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Logged</p>
                <p className="mt-2 text-lg font-semibold">GHS {result.loggedTotal.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Claimed</p>
                <p className="mt-2 text-lg font-semibold">GHS {result.claimedTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </main>
  );
}
