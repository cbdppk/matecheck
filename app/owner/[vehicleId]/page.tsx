import Link from "next/link";
import EarningsBar from "@/components/owner/EarningsBar";
import SummaryButton from "@/components/owner/SummaryButton";
import TripList from "@/components/owner/TripList";
import {
  getDailySummariesForVehicle,
  getTodaySummaryForVehicle,
  getTripsForVehicleDate,
  getVehicleById,
  todayAccra,
} from "@/lib/sampleData";

type Props = {
  params: { vehicleId: string };
};

export default function VehicleDetailPage({ params }: Props) {
  const { vehicleId } = params;
  const vehicle = getVehicleById(vehicleId);

  if (!vehicle) {
    return (
      <main className="screen-shell p-5">
        <p className="text-sm text-red-600">Vehicle not found.</p>
      </main>
    );
  }

  const todaySummary = getTodaySummaryForVehicle(vehicleId);
  const weeklySummaries = getDailySummariesForVehicle(vehicleId, 7);
  const todaysTrips = getTripsForVehicleDate(vehicleId, todayAccra);

  return (
    <main className="screen-shell p-5">
      <Link href="/owner" className="text-sm font-semibold text-brand">
        ← Back to fleet
      </Link>

      <div className="mt-4 section-card">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Vehicle</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{vehicle.plate}</h1>
        <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {vehicle.route}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Today</p>
            <p className="mt-2 text-xl font-semibold">GHS {todaySummary.total.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Trips</p>
            <p className="mt-2 text-xl font-semibold">{todaySummary.tripCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <EarningsBar summaries={weeklySummaries} />
      </div>

      <div className="mt-4">
        <SummaryButton vehicleId={vehicleId} date={todayAccra} />
      </div>

      <div className="mt-4">
        <TripList trips={todaysTrips} />
      </div>

      <div className="mt-4">
        <Link href={`/owner/${vehicleId}/dispute`} className="secondary-btn w-full">
          Open Dispute Resolver
        </Link>
      </div>
    </main>
  );
}
