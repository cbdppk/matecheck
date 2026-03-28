import { NextResponse } from "next/server";
import { z } from "zod";
import type { Trip, VoiceLogResponse } from "@/lib/contracts";
import { isDbConfigured, sql } from "@/lib/db";

const requestSchema = z.object({
  vehicleId: z.string().min(1),
  rawText: z.string().optional(),
  amount: z.number().optional(),
  route: z.string().optional(),
});

function parseAmount(text?: string) {
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function parseRoute(text?: string) {
  if (!text) return undefined;
  const cleaned = text
    .replace(/\d+(?:\.\d+)?/g, "")
    .replace(/cedis?/gi, "")
    .replace(/ghs/gi, "")
    .replace(/,+/g, " ")
    .trim();

  return cleaned || undefined;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" } satisfies VoiceLogResponse,
        { status: 400 },
      );
    }

    const { vehicleId, rawText, amount, route } = parsed.data;

    const resolvedAmount = amount ?? parseAmount(rawText);
    const resolvedRoute = route ?? parseRoute(rawText);

    if (!resolvedAmount || !resolvedRoute) {
      return NextResponse.json(
        { success: false, error: "Could not understand trip details" } satisfies VoiceLogResponse,
        { status: 400 },
      );
    }

    const trip: Trip = {
      id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      vehicleId,
      amount: resolvedAmount,
      route: resolvedRoute,
      loggedAt: new Date().toISOString(),
      rawVoiceText: rawText,
      confidence: rawText && !amount && !route ? "medium" : "high",
    };

    if (isDbConfigured()) {
      try {
        await sql`
          INSERT INTO trips (id, vehicle_id, amount, route, logged_at, raw_voice_text, confidence)
          VALUES (
            ${trip.id},
            ${trip.vehicleId},
            ${trip.amount},
            ${trip.route},
            ${trip.loggedAt},
            ${trip.rawVoiceText ?? null},
            ${trip.confidence}
          );
        `;
      } catch (dbError) {
        console.error("voice-log insert failed", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      trip,
      confirmationTwi: "Audio confirmation placeholder",
    } satisfies VoiceLogResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      } satisfies VoiceLogResponse,
      { status: 500 },
    );
  }
}
