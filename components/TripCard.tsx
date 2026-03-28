import type { Trip } from "@/lib/contracts";

interface TripCardProps {
  trip: Trip;
  variant: "mobile" | "desktop";
}

function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Accra",
  }).format(new Date(isoString));
}

function RouteArrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="#1E7A4A"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
  );
}

export default function TripCard({ trip, variant }: TripCardProps) {
  const [origin, destination] = trip.route.split("–");

  if (variant === "mobile") {
    return (
      <div className="bg-white rounded-[13px] border border-slate-100 px-4 py-3 mb-2 flex justify-between items-center min-h-[56px]">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-0.5 flex-wrap">
            <span className="text-[13px] font-semibold text-slate-900 truncate">
              {origin}
            </span>
            <RouteArrow />
            <span className="text-[13px] font-semibold text-slate-900 truncate">
              {destination ?? ""}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ml-1 flex-shrink-0 ${
                trip.confidence === "high" ? "bg-[#22C55E]" : "bg-[#F59E0B]"
              }`}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400">1 passenger</span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#CBD5E1] flex-shrink-0" />
            <span className="text-[11px] text-[#CBD5E1]">{formatTime(trip.loggedAt)}</span>
          </div>
        </div>

        <span className="text-sm font-bold text-slate-900 flex-shrink-0 ml-3">
          GHS {trip.amount}
        </span>
      </div>
    );
  }

  const confidencePill =
    trip.confidence === "high"
      ? "bg-[#DCFCE7] text-[#166534]"
      : "bg-[#FEF9C3] text-[#854D0E]";

  return (
    <div className="bg-white rounded-xl border border-slate-100 px-5 py-3.5 mb-2 flex justify-between items-center hover:border-green-100 transition-colors min-h-[60px]">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-0.5">
          <span className="text-sm font-semibold text-slate-900 truncate">{origin}</span>
          <RouteArrow />
          <span className="text-sm font-semibold text-slate-900 truncate">
            {destination ?? ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400">1 passenger</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#CBD5E1] flex-shrink-0" />
          <span className="text-[11px] text-slate-400">{formatTime(trip.loggedAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <span className="text-[15px] font-bold text-slate-900">GHS {trip.amount}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${confidencePill}`}>
          {trip.confidence === "high" ? "High" : "Med"}
        </span>
      </div>
    </div>
  );
}
