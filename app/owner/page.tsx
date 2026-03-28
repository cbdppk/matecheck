import VehicleCard from "@/components/owner/VehicleCard";
import { sampleSummaries, sampleVehicles, todayAccra } from "@/lib/sampleData";

export default function OwnerPage() {
  return (
    <main className="screen-shell p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Owner</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Your Fleet</h1>
        </div>

        <div className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
          {todayAccra}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {sampleVehicles.map((vehicle) => {
          const summary = sampleSummaries.find((item) => item.vehicleId === vehicle.id);

          if (!summary) return null;

          return <VehicleCard key={vehicle.id} vehicle={vehicle} summary={summary} />;
        })}
      </div>
    </main>
  );
}
