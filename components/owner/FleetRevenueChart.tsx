"use client";

export type FleetChartBar = {
  date: string;
  total: number;
};

type Props = {
  bars: FleetChartBar[];
  todayLabel: string;
  vehicleCount: number;
  /** Optional loading state while weekly fetches run */
  loading?: boolean;
};

function formatShortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return m && d ? `${m}/${d}` : iso.slice(5);
}

export default function FleetRevenueChart({ bars, todayLabel, vehicleCount, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="flex h-40 items-end gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full flex-col justify-end md:h-36">
                <div className="h-1/4 w-full animate-pulse rounded-t-xl bg-slate-100" />
              </div>
              <div className="h-3 w-6 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bars.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-base font-bold text-slate-900 md:text-lg">Fleet revenue trend</h3>
        <p className="mt-1 text-sm text-slate-500">Last 7 days · all vehicles combined</p>
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          No trip data in the last week yet. After drivers log trips, you&apos;ll see combined daily
          GHS here.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(...bars.map((b) => b.total), 1);
  const weekTotal = bars.reduce((s, b) => s + b.total, 0);
  const avgDaily = bars.length ? weekTotal / bars.length : 0;
  const todayBar = bars.find((b) => b.date === todayLabel);
  const best = bars.reduce((a, b) => (b.total > a.total ? b : a), bars[0]!);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 md:text-lg">Fleet revenue trend</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Combined GHS per day · {vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"} · Accra dates
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#1E7A4A]/10 px-3 py-1 text-xs font-semibold text-[#1E7A4A]">
          7-day view
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Week total</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">GHS {weekTotal.toFixed(0)}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Daily avg</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">GHS {avgDaily.toFixed(0)}</dd>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Today</dt>
          <dd className="mt-0.5 text-lg font-bold text-emerald-900">
            GHS {(todayBar?.total ?? 0).toFixed(0)}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Best day</dt>
          <dd className="mt-0.5 text-sm font-bold leading-tight text-slate-900">
            GHS {best.total.toFixed(0)}
            <span className="block text-[10px] font-normal text-slate-500">{formatShortDate(best.date)}</span>
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex items-end gap-1.5 md:gap-2">
        {bars.map((bar) => {
          const heightPct = Math.max(6, Math.round((bar.total / maxVal) * 100));
          const isToday = bar.date === todayLabel;

          return (
            <div key={bar.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full flex-col justify-end md:h-36">
                <div
                  title={`${bar.date}: GHS ${bar.total.toFixed(2)} (all vehicles)`}
                  className={`w-full min-h-[6px] rounded-t-xl transition-all ${
                    isToday ? "bg-[#1E7A4A] ring-2 ring-[#1E7A4A]/30 ring-offset-2" : "bg-slate-200"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <div className="text-center">
                <span
                  className={`block text-[10px] font-semibold md:text-[11px] ${isToday ? "text-[#1E7A4A]" : "text-slate-500"}`}
                >
                  {formatShortDate(bar.date)}
                </span>
                <span className="hidden text-[9px] text-slate-400 sm:block">
                  {bar.total > 0 ? `GHS ${bar.total.toFixed(0)}` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E7A4A]" />
          Today (Accra)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          Other days
        </div>
        <span className="ml-auto text-slate-400">Hover a bar for exact GHS</span>
      </div>
    </div>
  );
}
