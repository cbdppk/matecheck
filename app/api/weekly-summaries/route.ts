import { NextResponse } from "next/server";
import { z } from "zod";
import { getDailySummariesForVehicle } from "@/lib/sampleData";
import { isDbConfigured } from "@/lib/db";
import { buildDailySummariesForLastWeek } from "@/lib/tripDb";

const querySchema = z.object({
  vehicleId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      vehicleId: url.searchParams.get("vehicleId"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }

    const { vehicleId } = parsed.data;

    if (isDbConfigured()) {
      const summaries = await buildDailySummariesForLastWeek(vehicleId);
      return NextResponse.json(summaries);
    }

    return NextResponse.json(getDailySummariesForVehicle(vehicleId, 7));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load weekly summaries" },
      { status: 500 },
    );
  }
}
