import type { DailySummary } from "@/lib/contracts";

type Props = {
  summaries: DailySummary[];
};

export default function EarningsBar({ summaries }: Props) {
  const max = Math.max(...summaries.map((summary) => summary.total), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Revenue trend
          </h3>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">Last 7 days (GHS)</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
          Accra
        </span>
      </div>

      <div className="flex h-40 items-end gap-1.5 pt-2">
        {summaries.map((summary, index) => {
          const height = Math.max(12, Math.round((summary.total / max) * 100));
          const isToday = index === summaries.length - 1;
          const barClass = summary.anomaly
            ? "bg-red-500"
            : isToday
              ? "bg-[#1E7A4A]"
              : "bg-slate-300";

          return (
            <div
              key={`${summary.vehicleId}-${summary.date}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div
                title={`${summary.date}: GHS ${summary.total.toFixed(2)}`}
                className={`w-full max-w-[2.75rem] rounded-t-xl transition-all ${barClass}`}
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] font-medium text-slate-500">{summary.date.slice(5)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        Green bar = today · Red = below recent average
      </p>
    </div>
  );
}
