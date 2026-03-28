import type { Trip } from "@/lib/contracts";
import TripCard from "./TripCard";

interface TripFeedProps {
  trips: Trip[];
  sectionLabel?: string;
  emptyStateText?: string;
}

const SectionLabel = ({ label }: { label: string }) => (
  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2 px-1">
    {label}
  </p>
);

const EmptyState = ({ text }: { text: string }) => (
  <p className="text-sm text-slate-400 text-center py-10">{text}</p>
);

export default function TripFeed({
  trips,
  sectionLabel = "Today",
  emptyStateText = "No trips logged yet today.",
}: TripFeedProps) {
  const sorted = [...trips].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  );

  return (
    <>
      {/* Mobile feed — page scrolls, sticky TotalCard + BottomNav frame it */}
      <div className="md:hidden pt-44 pb-28 px-4">
        <SectionLabel label={sectionLabel} />
        {sorted.length === 0 ? (
          <EmptyState text={emptyStateText} />
        ) : (
          sorted.map((trip) => <TripCard key={trip.id} trip={trip} variant="mobile" />)
        )}
      </div>

      {/* Desktop feed — scrolls inside the fixed-height main column */}
      <div className="hidden md:flex md:flex-col flex-1 overflow-y-auto scrollbar-hide px-6 py-5">
        <SectionLabel label={sectionLabel} />
        {sorted.length === 0 ? (
          <EmptyState text={emptyStateText} />
        ) : (
          sorted.map((trip) => <TripCard key={trip.id} trip={trip} variant="desktop" />)
        )}
      </div>
    </>
  );
}
