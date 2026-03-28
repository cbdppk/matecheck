import { NextResponse } from "next/server";
import { z } from "zod";
import type { Trip, VoiceLogResponse } from "@/lib/contracts";
import { VOICE_PARSE_PROMPT } from "@/lib/prompts";
import { completeClaude, parseJsonFromAssistant } from "@/lib/claude";
import { ghanaNlpTts } from "@/lib/ghanaNlp";
import { isDbConfigured, sql } from "@/lib/db";

const requestSchema = z.object({
  vehicleId: z.string().min(1),
  rawText: z.string().optional().default(""),
  amount: z.number().optional(),
  route: z.string().optional(),
});

type ParseResult = {
  amount: number;
  route: string;
  confidence: "high" | "medium" | "low";
};

function parseAmountHeuristic(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function parseRouteHeuristic(text: string) {
  const cleaned = text
    .replace(/\d+(?:\.\d+)?/g, "")
    .replace(/cedis?/gi, "")
    .replace(/ghs/gi, "")
    .replace(/,+/g, " ")
    .trim();
  return cleaned || undefined;
}

function normalizeConfidence(
  value: unknown,
): "high" | "medium" | "low" {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "medium";
}

async function parseWithClaude(rawText: string): Promise<ParseResult | null> {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return null;
  }

  try {
    const user = `${VOICE_PARSE_PROMPT.trim()}\n\nTranscript: ${rawText}`;
    const assistant = await completeClaude({ user, maxTokens: 512 });
    const parsed = parseJsonFromAssistant<Record<string, unknown>>(assistant);
    if (!parsed || typeof parsed.amount !== "number" || typeof parsed.route !== "string") {
      return null;
    }
    return {
      amount: parsed.amount,
      route: parsed.route,
      confidence: normalizeConfidence(parsed.confidence),
    };
  } catch (error) {
    console.error("Claude voice parse failed", error);
    return null;
  }
}

function toDataUrlAudio(base64: string): string {
  const trimmed = base64.trim();
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `data:audio/mpeg;base64,${trimmed}`;
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

    const { vehicleId, rawText, amount: manualAmount, route: manualRoute } = parsed.data;
    const text = rawText.trim();

    const hasManual =
      typeof manualAmount === "number" &&
      !Number.isNaN(manualAmount) &&
      Boolean(manualRoute?.trim());

    let resolvedAmount: number | undefined;
    let resolvedRoute: string | undefined;
    let confidence: Trip["confidence"];

    if (hasManual) {
      resolvedAmount = manualAmount;
      resolvedRoute = manualRoute!.trim();
      confidence = "high";
    } else if (text.length > 0) {
      const claude = await parseWithClaude(text);
      if (claude) {
        resolvedAmount = claude.amount;
        resolvedRoute = claude.route;
        confidence = claude.confidence;
      } else {
        resolvedAmount = parseAmountHeuristic(text);
        resolvedRoute = parseRouteHeuristic(text);
        confidence = "medium";
      }
    } else {
      resolvedAmount = undefined;
      resolvedRoute = undefined;
      confidence = "high";
    }

    if (
      resolvedAmount === undefined ||
      Number.isNaN(resolvedAmount) ||
      !resolvedRoute?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Could not understand trip details" } satisfies VoiceLogResponse,
        { status: 400 },
      );
    }

    const trip: Trip = {
      id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      vehicleId,
      amount: Number(resolvedAmount.toFixed(2)),
      route: resolvedRoute.trim(),
      loggedAt: new Date().toISOString(),
      rawVoiceText: text || undefined,
      confidence,
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
        return NextResponse.json(
          { success: false, error: "Database error" } satisfies VoiceLogResponse,
          { status: 500 },
        );
      }
    }

    const twiLine = `Wo trip no: ${trip.route}, GHS ${trip.amount.toFixed(2)}.`;
    const audioB64 = await ghanaNlpTts(
      `Akwaaaba. ${twiLine} Wo kwan so yiye.`,
    );
    const confirmationTwi = audioB64 ? toDataUrlAudio(audioB64) : undefined;

    return NextResponse.json({
      success: true,
      trip,
      confirmationTwi,
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
