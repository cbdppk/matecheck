import Link from "next/link";
import type { DailySummary, Vehicle } from "@/lib/contracts";

type Props = {
  vehicle: Vehicle;
  summary: DailySummary;
};

export default function VehicleCard({ vehicle, summary }: Props) {
  return (
    <Link href={`/owner/${vehicle.id}`} className="section-card block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Vehicle
          </p>
          <h3 className="mt-1 text-2xl font-bold text-ink">{vehicle.plate}</h3>
        </div>

        {summary.anomaly ? (
          <span className="pill bg-red-100 text-red-700">Low earnings</span>
        ) : (
          <span className="pill bg-emerald-100 text-emerald-700">On track</span>
        )}
      </div>

      <div className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
        {vehicle.route}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Today</p>
          <p className="mt-2 text-xl font-semibold">GHS {summary.total.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Trips</p>
          <p className="mt-2 text-xl font-semibold">{summary.tripCount}</p>
        </div>
      </div>
    </Link>
  );
}
