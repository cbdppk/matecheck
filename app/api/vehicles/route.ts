import { NextResponse } from "next/server";
import { getTodaySummaryForVehicle, sampleVehicles } from "@/lib/sampleData";
import { isDbConfigured } from "@/lib/db";
import { getFleetFromDb } from "@/lib/tripDb";

export async function GET() {
  try {
    if (isDbConfigured()) {
      const items = await getFleetFromDb();
      return NextResponse.json(items);
    }

    return NextResponse.json(
      sampleVehicles.map((vehicle) => ({
        vehicle,
        summary: getTodaySummaryForVehicle(vehicle.id),
      })),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load vehicles" },
      { status: 500 },
    );
  }
}
