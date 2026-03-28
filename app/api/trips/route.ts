import { NextResponse } from "next/server";
import { z } from "zod";
import { getTripsForVehicleDate, todayAccra } from "@/lib/sampleData";
import { isDbConfigured, sql } from "@/lib/db";
import type { Trip } from "@/lib/contracts";

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

    const { vehicleId, date } = parsed.data;

    if (isDbConfigured()) {
      const rows = await sql`
        SELECT id, vehicle_id, amount, route, logged_at, raw_voice_text, confidence
        FROM trips
        WHERE vehicle_id = ${vehicleId} AND DATE(logged_at) = ${date}
        ORDER BY logged_at DESC;
      `;

      const trips: Trip[] = rows.map((row) => ({
        id: String(row.id),
        vehicleId: String(row.vehicle_id),
        amount: Number(row.amount),
        route: String(row.route),
        loggedAt: new Date(row.logged_at).toISOString(),
        rawVoiceText: row.raw_voice_text ? String(row.raw_voice_text) : undefined,
        confidence: row.confidence as Trip["confidence"],
      }));

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
