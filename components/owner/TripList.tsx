import type { Trip } from "@/lib/contracts";

type Props = {
  trips: Trip[];
};

function confidenceClass(confidence: Trip["confidence"]) {
  if (confidence === "low") return "bg-red-100 text-red-700";
  if (confidence === "medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function TripList({ trips }: Props) {
  if (trips.length === 0) {
    return (
      <div className="section-card text-sm text-gray-600">
        No trips logged today
      </div>
    );
  }

  return (
    <div className="section-card p-0">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-ink">Trip list</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {trips.map((trip) => (
          <div key={trip.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(trip.loggedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 text-sm text-gray-600">{trip.route}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">GHS {trip.amount.toFixed(2)}</p>
              <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${confidenceClass(trip.confidence)}`}>
                {trip.confidence}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
