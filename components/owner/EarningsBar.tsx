import type { DailySummary } from "@/lib/contracts";

type Props = {
  summaries: DailySummary[];
};

export default function EarningsBar({ summaries }: Props) {
  if (summaries.length === 0) {
    return (
      <div className="section-card">
        <h3 className="text-lg font-semibold text-ink">Last 7 days</h3>
        <p className="mt-2 text-sm text-slate-600">
          No daily totals for this vehicle in the last week yet. Log trips to see the trend.
        </p>
      </div>
    );
  }

  const max = Math.max(...summaries.map((s) => s.total), 1);

  return (
    <div className="section-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-ink">Last 7 days</h3>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">GHS · Accra</p>
      </div>

      <div className="flex items-end gap-1.5 md:gap-2">
        {summaries.map((summary, index) => {
          const heightPct = Math.max(8, Math.round((summary.total / max) * 100));
          const isToday = index === summaries.length - 1;
          const barClass = summary.anomaly
            ? "bg-red-500"
            : isToday
              ? "bg-[#1E7A4A]"
              : "bg-gray-300";

          return (
            <div
              key={`${summary.vehicleId}-${summary.date}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              {/* Fixed-height track so % heights resolve (same pattern as fleet chart) */}
              <div className="flex h-32 w-full flex-col justify-end md:h-40">
                <div
                  title={`${summary.date}: GHS ${summary.total.toFixed(2)}`}
                  className={`w-full min-h-[6px] rounded-t-xl transition-all ${barClass}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-500 md:text-[11px]">
                {summary.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
