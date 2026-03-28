import {
  getTripsForVehicle,
  sampleVehicles,
  summarizeTrips,
  todayAccra,
} from "@/lib/sampleData";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TotalCard from "@/components/TotalCard";
import TripFeed from "@/components/TripFeed";

export default function DriverLogsPage() {
  const vehicle = sampleVehicles[0]!;
  const trips = getTripsForVehicle(vehicle.id);
  const summary = summarizeTrips(vehicle.id, todayAccra);

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:flex md:h-screen md:overflow-hidden">
      <Sidebar vehicle={vehicle} summary={summary} activePage="logs" />

      <div className="flex flex-col md:flex-1 md:overflow-hidden">
        <TotalCard total={summary.total} />
        <TopBar title="All trip logs" />
        <TripFeed
          trips={trips}
          sectionLabel="All logs"
          emptyStateText="No trip logs available yet."
        />
        <BottomNav />
      </div>
    </div>
  );
}
