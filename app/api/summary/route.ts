import { NextResponse } from "next/server";
import { z } from "zod";
import type { DailySummary, SummaryResponse, Trip } from "@/lib/contracts";
import { summarizeTrips } from "@/lib/sampleData";
import { isDbConfigured, sql } from "@/lib/db";

const requestSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
});

function buildNotes(summary: DailySummary) {
  if (summary.anomaly) {
    return {
      twi: "Ɛnnɛ sika a wɔaboa ano no so atew sen daadaa no. Hwɛ trip no mu bio na fa toto nnansa yi ho.",
      en: "Today's earnings are below the recent average. Review the trip records against the last few days.",
    };
  }

  return {
    twi: "Ɛnnɛ adwuma no rekɔ yiye. Trip no dodow ne sika a wɔaboa ano no kɔ pɛpɛɛpɛ.",
    en: "Today's operation looks steady. Trip count and total earnings are tracking normally.",
  };
}

async function readTripsFromDb(vehicleId: string, date: string): Promise<Trip[]> {
  const rows = await sql`
    SELECT id, vehicle_id, amount, route, logged_at, raw_voice_text, confidence
    FROM trips
    WHERE vehicle_id = ${vehicleId} AND DATE(logged_at) = ${date}
    ORDER BY logged_at DESC;
  `;

  return rows.map((row) => ({
    id: String(row.id),
    vehicleId: String(row.vehicle_id),
    amount: Number(row.amount),
    route: String(row.route),
    loggedAt: new Date(row.logged_at).toISOString(),
    rawVoiceText: row.raw_voice_text ? String(row.raw_voice_text) : undefined,
    confidence: row.confidence as Trip["confidence"],
  }));
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { vehicleId, date } = parsed.data;

    let summary: DailySummary;

    if (isDbConfigured()) {
      const trips = await readTripsFromDb(vehicleId, date);
      const total = Number(trips.reduce((sum, trip) => sum + trip.amount, 0).toFixed(2));
      const tripCount = trips.length;
      const avgPerTrip = tripCount ? Number((total / tripCount).toFixed(2)) : 0;

      const recentRows = await sql`
        SELECT DATE(logged_at) AS date, SUM(amount) AS daily_total
        FROM trips
        WHERE vehicle_id = ${vehicleId} AND logged_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(logged_at);
      `;

      const recentTotals = recentRows.map((row) => Number(row.daily_total));
      const recentAverage =
        recentTotals.length > 0
          ? recentTotals.reduce((sum, value) => sum + value, 0) / recentTotals.length
          : 0;

      summary = {
        vehicleId,
        date,
        total,
        tripCount,
        avgPerTrip,
        anomaly: total < recentAverage * 0.7,
      };
    } else {
      summary = summarizeTrips(vehicleId, date);
    }

    const notes = buildNotes(summary);

    const payload: SummaryResponse = {
      summary: {
        ...summary,
        aiNote: notes.en,
      },
      aiNoteTwi: notes.twi,
      aiNoteEn: notes.en,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate summary" },
      { status: 500 },
    );
  }
}
