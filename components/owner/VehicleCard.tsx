import Link from "next/link";
import type { DailySummary, Vehicle } from "@/lib/contracts";

type Props = {
  vehicle: Vehicle;
  summary: DailySummary;
};

export default function VehicleCard({ vehicle, summary }: Props) {
  return (
    <Link
      href={`/owner/${vehicle.id}`}
      className="group flex items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-slate-300 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">{vehicle.plate}</h3>
          {summary.anomaly ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
              Low earnings
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              On track
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{vehicle.route}</p>
        <p className="mt-1 text-xs text-slate-400">Owner · {vehicle.ownerName}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Today</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">GHS {summary.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Trips</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{summary.tripCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border-l border-slate-100 pl-3">
        <span
          className="text-slate-300 transition group-hover:text-[#1E7A4A]"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          Open
        </span>
      </div>
    </Link>
  );
}
