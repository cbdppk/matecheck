import {
  getTripsForVehicleDate,
  sampleVehicles,
  summarizeTrips,
  todayAccra,
} from "@/lib/sampleData";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TotalCard from "@/components/TotalCard";
import TripFeed from "@/components/TripFeed";

export default function DriverHomePage() {
  const vehicle = sampleVehicles[0]!;
  const trips = getTripsForVehicleDate(vehicle.id, todayAccra);
  const summary = summarizeTrips(vehicle.id, todayAccra);

  return (
    /*
     * Mobile  (<md): flex-col, natural page scroll.
     *   TotalCard is sticky top-0; BottomNav is sticky bottom-0.
     *   TripFeed's mobile div uses pt-44/pb-28 to clear both.
     *
     * Desktop (≥md): flex-row, h-screen, overflow-hidden.
     *   Sidebar is fixed-width; main column scrolls the feed internally.
     */
    <div className="min-h-screen bg-[#F8FAFC] md:flex md:h-screen md:overflow-hidden">
      <Sidebar vehicle={vehicle} summary={summary} />

      <div className="flex flex-col md:flex-1 md:overflow-hidden">
        <TotalCard total={summary.total} />
        <TopBar />
        <TripFeed trips={trips} />
        <BottomNav />
      </div>
    </div>
  );
}
