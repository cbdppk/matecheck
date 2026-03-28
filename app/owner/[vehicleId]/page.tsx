import VehicleDetailView from "@/components/owner/VehicleDetailView";

type Props = {
  params: Promise<{ vehicleId: string }>;
};

export default async function VehicleDetailPage({ params }: Props) {
  const { vehicleId } = await params;
  return (
    <main className="owner-page">
      <div className="owner-shell">
        <VehicleDetailView vehicleId={vehicleId} />
      </div>
    </main>
  );
}
