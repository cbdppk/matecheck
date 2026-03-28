import { NextResponse } from "next/server";
import { z } from "zod";
import type { DailySummary, SummaryResponse, Trip } from "@/lib/contracts";
import { DAILY_SUMMARY_PROMPT } from "@/lib/prompts";
import { getTripsForVehicleDate, summarizeTrips } from "@/lib/sampleData";
import { isDbConfigured, sql } from "@/lib/db";
import { completeClaude, parseJsonFromAssistant } from "@/lib/claude";
import {
  computeDailySummaryDb,
  fetchTripsForVehicleOnDate,
} from "@/lib/tripDb";

const requestSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
});

function fallbackNotes(summary: DailySummary) {
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

async function claudeDailyNotes(trips: Trip[]): Promise<{ twi: string; en: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return null;
  }

  const payload = trips.map((t) => ({
    amount: t.amount,
    route: t.route,
    confidence: t.confidence,
    time: t.loggedAt,
  }));

  const user = `${DAILY_SUMMARY_PROMPT.trim()}\n\nTrip data (JSON):\n${JSON.stringify(payload)}`;

  try {
    const assistant = await completeClaude({ user, maxTokens: 512 });
    const parsed = parseJsonFromAssistant<{ twi?: string; en?: string }>(assistant);
    if (!parsed?.twi || !parsed?.en) {
      return null;
    }
    return { twi: parsed.twi, en: parsed.en };
  } catch (error) {
    console.error("Claude daily summary failed", error);
    return null;
  }
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
    let trips: Trip[];

    if (isDbConfigured()) {
      summary = await computeDailySummaryDb(vehicleId, date);
      trips = await fetchTripsForVehicleOnDate(vehicleId, date);
    } else {
      summary = summarizeTrips(vehicleId, date);
      trips = getTripsForVehicleDate(vehicleId, date);
    }

    const notes = (await claudeDailyNotes(trips)) ?? fallbackNotes(summary);

    const summaryWithNote: DailySummary = {
      ...summary,
      aiNote: notes.en,
    };

    if (isDbConfigured()) {
      try {
        await sql`
          INSERT INTO daily_summary (
            vehicle_id, date, total, trip_count, avg_per_trip, ai_note, anomaly
          )
          VALUES (
            ${summary.vehicleId},
            ${summary.date},
            ${summary.total},
            ${summary.tripCount},
            ${summary.avgPerTrip},
            ${notes.en},
            ${summary.anomaly}
          )
          ON CONFLICT (vehicle_id, date)
          DO UPDATE SET
            total = EXCLUDED.total,
            trip_count = EXCLUDED.trip_count,
            avg_per_trip = EXCLUDED.avg_per_trip,
            ai_note = EXCLUDED.ai_note,
            anomaly = EXCLUDED.anomaly;
        `;
      } catch (error) {
        console.error("daily_summary upsert failed", error);
      }
    }

    const payload: SummaryResponse = {
      summary: summaryWithNote,
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
