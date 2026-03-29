import { NextResponse } from "next/server";

const BASE = "https://translation-api.ghananlp.org";

export async function POST(request: Request) {
  const key = process.env.GHANA_NLP_API_KEY?.trim();

  if (!key) {
    return NextResponse.json({ error: "Audio not available" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const res = await fetch(`${BASE}/tts/v1/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": key,
      },
      body: JSON.stringify({ text, language: "tw" }),
    });

    const raw = await res.text();
    console.log("[GhanaNLP TTS] status:", res.status, "body (first 200):", raw.slice(0, 200));

    if (!res.ok) {
      return NextResponse.json({ error: "Audio not available" }, { status: 503 });
    }

    // Parse: TTS may return { audio_base64, audio, data } depending on API version
    let b64: string | undefined;
    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      b64 =
        (typeof data.audio_base64 === "string" ? data.audio_base64 : undefined) ??
        (typeof data.audio === "string" ? data.audio : undefined) ??
        (typeof data.data === "string" ? data.data : undefined);
    } catch {
      // raw might itself be the base64 string
      if (/^[A-Za-z0-9+/=]+$/.test(raw.trim())) {
        b64 = raw.trim();
      }
    }

    if (!b64) {
      console.error("[GhanaNLP TTS] unexpected response shape:", raw.slice(0, 300));
      return NextResponse.json({ error: "Audio not available" }, { status: 503 });
    }

    // GhanaNLP TTS returns WAV audio
    return NextResponse.json({ audio: `data:audio/wav;base64,${b64}` });
  } catch (err) {
    console.error("[GhanaNLP TTS] error:", err);
    return NextResponse.json({ error: "Could not generate audio" }, { status: 500 });
  }
}
