import { NextResponse } from "next/server";
import { getTodaySummaryForVehicle, sampleVehicles } from "@/lib/sampleData";
import { isDbConfigured, sql } from "@/lib/db";

export async function GET() {
  try {
    if (isDbConfigured()) {
      const vehicleRows = await sql`
        SELECT id, plate, owner_name, route
        FROM vehicles
        ORDER BY plate ASC;
      `;

      const items = await Promise.all(
        vehicleRows.map(async (row) => {
          const summaryRows = await sql`
            SELECT vehicle_id, date, total, trip_count, avg_per_trip, ai_note, anomaly
            FROM daily_summary
            WHERE vehicle_id = ${row.id}
            ORDER BY date DESC
            LIMIT 1;
          `;

          return {
            vehicle: {
              id: String(row.id),
              plate: String(row.plate),
              ownerName: String(row.owner_name),
              route: String(row.route),
            },
            summary: summaryRows[0]
              ? {
                  vehicleId: String(summaryRows[0].vehicle_id),
                  date: String(summaryRows[0].date),
                  total: Number(summaryRows[0].total),
                  tripCount: Number(summaryRows[0].trip_count),
                  avgPerTrip: Number(summaryRows[0].avg_per_trip),
                  aiNote: summaryRows[0].ai_note ? String(summaryRows[0].ai_note) : undefined,
                  anomaly: Boolean(summaryRows[0].anomaly),
                }
              : null,
          };
        }),
      );

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
