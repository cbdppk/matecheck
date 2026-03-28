import { NextResponse } from "next/server";
import { z } from "zod";
import type { DisputeResponse, Trip } from "@/lib/contracts";
import { DISPUTE_PROMPT } from "@/lib/prompts";
import { getTripsForVehicleDate } from "@/lib/sampleData";
import { isDbConfigured } from "@/lib/db";
import { completeClaude, parseJsonFromAssistant } from "@/lib/claude";
import { ghanaNlpTranslateEnToTw } from "@/lib/ghanaNlp";
import { fetchTripsForVehicleOnDate } from "@/lib/tripDb";

const requestSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
  ownerClaim: z.string().min(1),
  claimedAmount: z.number().optional(),
});

function extractClaimedAmountRegex(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

async function extractClaimedWithClaude(ownerClaim: string): Promise<number | null> {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return null;
  }

  const user = `Extract the claimed amount in Ghana cedis (GHS) as a number from the owner's text. Return JSON only: {"amount": number} or {"amount": null} if unclear.\n\nText: ${ownerClaim}`;

  try {
    const assistant = await completeClaude({ user, maxTokens: 256 });
    const parsed = parseJsonFromAssistant<{ amount?: number | null }>(assistant);
    if (parsed?.amount === null || parsed?.amount === undefined) {
      return null;
    }
    if (typeof parsed.amount !== "number" || Number.isNaN(parsed.amount)) {
      return null;
    }
    return parsed.amount;
  } catch (error) {
    console.error("Claude claim extract failed", error);
    return null;
  }
}

async function runDisputeClaude(params: {
  vehicleId: string;
  date: string;
  loggedTotal: number;
  claimedTotal: number;
  ownerClaim: string;
  trips: Trip[];
}): Promise<Pick<DisputeResponse, "analysisEn" | "analysisTwi" | "verdict"> | null> {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return null;
  }

  const context = {
    vehicleId: params.vehicleId,
    date: params.date,
    loggedTotal: params.loggedTotal,
    claimedTotal: params.claimedTotal,
    ownerClaim: params.ownerClaim,
    trips: params.trips.map((t) => ({
      id: t.id,
      amount: t.amount,
      route: t.route,
      loggedAt: t.loggedAt,
      confidence: t.confidence,
    })),
  };

  const user = `${DISPUTE_PROMPT.trim()}\n\nContext (JSON):\n${JSON.stringify(context)}`;

  try {
    const assistant = await completeClaude({ user, maxTokens: 1024 });
    const parsed = parseJsonFromAssistant<{
      analysisEn?: string;
      analysisTwi?: string;
      verdict?: string;
    }>(assistant);

    if (
      !parsed?.analysisEn ||
      !parsed?.verdict ||
      !["matches", "gap_explained", "gap_unexplained"].includes(parsed.verdict)
    ) {
      return null;
    }

    let analysisTwi = parsed.analysisTwi?.trim();
    if (!analysisTwi) {
      analysisTwi =
        (await ghanaNlpTranslateEnToTw(parsed.analysisEn)) ?? parsed.analysisEn;
    }

    return {
      analysisEn: parsed.analysisEn,
      analysisTwi,
      verdict: parsed.verdict as DisputeResponse["verdict"],
    };
  } catch (error) {
    console.error("Claude dispute failed", error);
    return null;
  }
}

function heuristicDispute(
  loggedTotal: number,
  claimedTotal: number,
  tripCount: number,
): Pick<DisputeResponse, "analysisEn" | "analysisTwi" | "verdict"> {
  const difference = Math.abs(claimedTotal - loggedTotal);

  if (difference === 0) {
    return {
      verdict: "matches",
      analysisEn: `The claimed amount matches the logged records. The system shows ${tripCount} trips for the selected day.`,
      analysisTwi: `Sika a wɔaka no ne sika a wɔakyerɛw no hyia. System no huu trip ${tripCount} wɔ da no mu.`,
    };
  }

  if (difference <= 15) {
    return {
      verdict: "gap_explained",
      analysisEn:
        "There is a small difference between the claim and the logged total. It may be rounding or one unrecorded short trip.",
      analysisTwi:
        "Nsonsonoe ketewa bi wɔ sika a wɔaka ne sika a wɔakyerɛw no ntam. Ebia ɛyɛ akontaa anaa trip ketewa bi a wɔankyerɛw.",
    };
  }

  return {
    verdict: "gap_unexplained",
    analysisEn:
      "The claim is significantly different from the logged total. The records do not fully explain the gap.",
    analysisTwi:
      "Sika a wɔaka no yɛ fã sen sika a wɔakyerɛw no. Nkra a ɛwɔ hɔ nyinaa nkyerɛ nsonsonoe no.",
  };
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
      ? await fetchTripsForVehicleOnDate(vehicleId, date)
      : getTripsForVehicleDate(vehicleId, date);

    const loggedTotal = Number(trips.reduce((sum, trip) => sum + trip.amount, 0).toFixed(2));

    let resolvedClaimed = claimedAmount;
    if (resolvedClaimed === undefined) {
      const fromClaude = await extractClaimedWithClaude(ownerClaim);
      resolvedClaimed = fromClaude ?? extractClaimedAmountRegex(ownerClaim);
    }

    const ai = await runDisputeClaude({
      vehicleId,
      date,
      loggedTotal,
      claimedTotal: resolvedClaimed,
      ownerClaim,
      trips,
    });

    const resolved = ai ?? heuristicDispute(loggedTotal, resolvedClaimed, trips.length);

    const payload: DisputeResponse = {
      analysisEn: resolved.analysisEn,
      analysisTwi: resolved.analysisTwi,
      loggedTotal,
      claimedTotal: resolvedClaimed,
      verdict: resolved.verdict,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not review dispute" },
      { status: 500 },
    );
  }
}
