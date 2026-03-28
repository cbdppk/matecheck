import { NextResponse } from "next/server";
import { z } from "zod";
import type { DisputeResponse, Trip } from "@/lib/contracts";
import { getTripsForVehicleDate } from "@/lib/sampleData";
import { isDbConfigured, sql } from "@/lib/db";

const requestSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
  ownerClaim: z.string().min(1),
  claimedAmount: z.number().optional(),
});

function extractClaimedAmount(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function buildVerdict(loggedTotal: number, claimedTotal: number): DisputeResponse["verdict"] {
  const difference = Math.abs(claimedTotal - loggedTotal);

  if (difference === 0) {
    return "matches";
  }

  if (difference <= 15) {
    return "gap_explained";
  }

  return "gap_unexplained";
}

function buildAnalysis(loggedTotal: number, claimedTotal: number, tripCount: number) {
  const difference = claimedTotal - loggedTotal;

  if (difference === 0) {
    return {
      en: `The claimed amount matches the logged records exactly. The system found ${tripCount} trips and no revenue gap for the selected day.`,
      twi: `Sika a wɔaka no ne sika a wɔakyerɛw no hyia pɛpɛɛpɛ. System no huu trip ${tripCount} na wanhu sika biara a ayera wɔ da no mu.`,
    };
  }

  if (Math.abs(difference) <= 15) {
    return {
      en: `There is a small difference between the claim and the logged total. The gap may be from one missed or rounded trip, so this needs a quick manual check.`,
      twi: `Nsonsonoe ketewa bi wɔ sika a wɔaka ne sika a wɔakyerɛw no ntam. Ebia trip baako na wɔankyerɛw anaa wɔbɔɔ no akontaa pɛsɛmenkominya, enti ɛsɛ sɛ wɔhwɛ mu ntɛm.`,
    };
  }

  return {
    en: `The claim is meaningfully higher than the logged total. The current records do not fully explain the difference, so this should be treated as an unresolved gap.`,
    twi: `Sika a wɔaka no sɔre sen sika a wɔakyerɛw no kɛse. Record a ɛwɔ hɔ mpɛ mu nkyerɛkyerɛmu mma nsonsonoe no, enti ɛsɛ sɛ wɔfa no sɛ asɛm a ennyaa nkyerɛmu da.`,
    };
  }
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

    const { vehicleId, date, ownerClaim, claimedAmount } = parsed.data;

    const trips = isDbConfigured()
      ? await readTripsFromDb(vehicleId, date)
      : getTripsForVehicleDate(vehicleId, date);

    const loggedTotal = Number(trips.reduce((sum, trip) => sum + trip.amount, 0).toFixed(2));
    const resolvedClaimed = claimedAmount ?? extractClaimedAmount(ownerClaim);
    const verdict = buildVerdict(loggedTotal, resolvedClaimed);
    const analysis = buildAnalysis(loggedTotal, resolvedClaimed, trips.length);

    const payload: DisputeResponse = {
      analysisEn: analysis.en,
      analysisTwi: analysis.twi,
      loggedTotal,
      claimedTotal: resolvedClaimed,
      verdict,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not review dispute" },
      { status: 500 },
    );
  }
}
