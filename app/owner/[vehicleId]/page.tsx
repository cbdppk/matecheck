import VehicleDetailView from "@/components/owner/VehicleDetailView";

type Props = {
  params: Promise<{ vehicleId: string }>;
};

export default async function VehicleDetailPage({ params }: Props) {
  const { vehicleId } = await params;
  return <VehicleDetailView vehicleId={vehicleId} />;
}
