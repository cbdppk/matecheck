import type { Trip } from "@/lib/contracts";

type Props = {
  trips: Trip[];
  listTitle?: string;
};

function confidenceClass(confidence: Trip["confidence"]) {
  if (confidence === "low") return "bg-red-100 text-red-700";
  if (confidence === "medium") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

export default function TripList({ trips, listTitle = "Today’s trips" }: Props) {
  if (trips.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{listTitle}</p>
        <p className="mt-2 text-sm text-slate-600">No trips logged for this day yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{listTitle}</h3>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">{trips.length} entries</p>
      </div>

      <ol className="divide-y divide-slate-100">
        {trips.map((trip) => (
          <li key={trip.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {new Date(trip.loggedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 truncate text-sm text-slate-600">{trip.route}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">GHS {trip.amount.toFixed(2)}</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${confidenceClass(trip.confidence)}`}
              >
                {trip.confidence}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
