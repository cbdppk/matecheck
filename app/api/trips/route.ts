import { NextResponse } from "next/server";
import { z } from "zod";
import { getTripsForVehicleDate, todayAccra } from "@/lib/sampleData";
import { isDbConfigured } from "@/lib/db";
import type { Trip } from "@/lib/contracts";
import { fetchTripsForVehicleOnDate } from "@/lib/tripDb";

const querySchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      vehicleId: url.searchParams.get("vehicleId"),
      date: url.searchParams.get("date") ?? todayAccra,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }

    const { vehicleId, date: dateParam } = parsed.data;
    const date = dateParam ?? todayAccra;

    if (isDbConfigured()) {
      const trips: Trip[] = await fetchTripsForVehicleOnDate(vehicleId, date);
      return NextResponse.json(trips);
    }

    return NextResponse.json(getTripsForVehicleDate(vehicleId, date));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load trips" },
      { status: 500 },
    );
  }
}
