const TTS_URL = "https://translation.ghananlp.org/v1/tts";
const TRANSLATE_URL = "https://translation.ghananlp.org/v1/translate";

function subscriptionHeaders(): HeadersInit | null {
  const key = process.env.GHANA_NLP_API_KEY?.trim();
  if (!key) {
    return null;
  }
  return {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": key,
  };
}

export function isGhanaNlpConfigured(): boolean {
  return Boolean(process.env.GHANA_NLP_API_KEY?.trim());
}

/** Returns raw base64 audio (no data: prefix), or null on failure / missing key. */
export async function ghanaNlpTts(text: string): Promise<string | null> {
  const headers = subscriptionHeaders();
  if (!headers) {
    return null;
  }

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ text, language: "tw" }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("GhanaNLP TTS error", response.status, err.slice(0, 200));
      return null;
    }

    const data = (await response.json()) as { audio?: string; data?: string };
    const b64 = data.audio ?? data.data;
    if (!b64 || typeof b64 !== "string") {
      console.error("GhanaNLP TTS: unexpected response shape");
      return null;
    }
    return b64;
  } catch (error) {
    console.error("GhanaNLP TTS", error);
    return null;
  }
}

export async function ghanaNlpTranslateEnToTw(sentence: string): Promise<string | null> {
  const headers = subscriptionHeaders();
  if (!headers) {
    return null;
  }

  try {
    const response = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ in: "en", out: "tw", sentence }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("GhanaNLP translate error", response.status, err.slice(0, 200));
      return null;
    }

    const data = (await response.json()) as { translation?: string };
    return data.translation ?? null;
  } catch (error) {
    console.error("GhanaNLP translate", error);
    return null;
  }
}
