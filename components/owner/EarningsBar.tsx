import type { DailySummary } from "@/lib/contracts";

type Props = {
  summaries: DailySummary[];
};

export default function EarningsBar({ summaries }: Props) {
  const max = Math.max(...summaries.map((summary) => summary.total), 1);

  return (
    <div className="section-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Last 7 days</h3>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">GHS trend</p>
      </div>

      <div className="flex h-40 items-end gap-2 md:h-52">
        {summaries.map((summary, index) => {
          const height = Math.max(12, Math.round((summary.total / max) * 100));
          const isToday = index === summaries.length - 1;
          const barClass = summary.anomaly
            ? "bg-red-500"
            : isToday
              ? "bg-[#1E7A4A]"
              : "bg-gray-300";

          return (
            <div key={`${summary.vehicleId}-${summary.date}`} className="flex flex-1 flex-col items-center gap-2">
              <div
                title={`GHS ${summary.total.toFixed(2)}`}
                className={`w-full rounded-t-2xl transition-all ${barClass}`}
                style={{ height: `${height}%` }}
              />
              <span className="text-[11px] font-medium text-gray-500">
                {summary.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
