import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { correctAsrText } from "@/lib/asrCorrections";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST { text: string }      → parse trip details from Twi/English text
// POST { summarize: string } → generate a short Twi driver summary
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── Summary mode ──────────────────────────────────────────────
  if (body.summarize) {
    const context: string = body.summarize;

    try {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: `You are a helpful assistant for trotro (minibus) drivers in Ghana.
Write a SHORT 1-sentence encouraging summary of this driver's trip in Twi (Akan language).
Keep it natural, warm, and brief — like something a dispatcher would say.

Trip info: ${context}

Respond with ONLY the Twi sentence. Nothing else.`,
          },
        ],
      });

      const summary =
        msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
      console.log("[Anthropic Summary]", summary);
      return NextResponse.json({ summary });
    } catch (e) {
      console.error("[Anthropic Summary] error:", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  // ── Parse mode ────────────────────────────────────────────────
  const rawText: string = body.text ?? "";
  if (!rawText) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  // Run deterministic ASR corrections before touching the LLM
  const { text, log: correctionLog } = correctAsrText(rawText);
  if (correctionLog) {
    console.log("[ASR Corrections]", correctionLog);
  }

  const field: "route" | "amount" | undefined = body.field;

  // ── Focused: route only ───────────────────────────────────────
  if (field === "route") {
    try {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 128,
        messages: [{
          role: "user",
          content: `You extract trotro route names for drivers in Ghana.
The text is a voice transcript — it contains ONLY a place name or a route (origin and/or destination). No numbers or amounts.

Known places — Kumasi: Tech, KNUST, Adum, Abuakwa, Ahodwo, Asafo, Ayeduase, Santase, Tanoso, Amakom, Maxima, Ejisu, Effiduasi, Agogo, Angola, Suame, Kejetia, Tafo, Bantama, Nhyiaeso, Bomso, Patasi, Asokwa, Oforikrom, Kotei, Ayigya, Roman Hill
Accra: Accra, Madina, Circle, Kaneshie, Lapaz, Achimota, Legon, Adenta, Tema, Osu, Dansoman, Mallam

Text: "${text}"

Return ONLY valid JSON — no markdown:
{"route":"Origin–Destination","confidence":"high|medium|low"}
If only one place: {"route":"PlaceName","confidence":"high"}`,
        }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      console.log("[Parse route]", parsed);
      return NextResponse.json(parsed);
    } catch (e) {
      console.error("[Parse route] error:", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  // ── Focused: amount only ──────────────────────────────────────
  if (field === "amount") {
    try {
      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 128,
        messages: [{
          role: "user",
          content: `You extract money amounts for trotro trip sales in Ghana.
The text is a voice transcript — it contains ONLY a number or amount in GHS (Ghana cedis).

Twi/pidgin number words:
"too"/"tu" → 2, "tri"/"tre"/"nsa" → 3, "fo"/"anan" → 4, "fai"/"faifu"/"enum" → 5,
"sikis"/"asia"/"nsia" → 6, "sebi"/"seben"/"ason" → 7, "eit"/"ntwe" → 8,
"nain"/"nkron" → 9, "du"/"edu" → 10, "aduonu"/"twenti" → 20, "aduasa" → 30, "aduonum" → 50
"sidis"/"ntisidis"/"seadis"/"cedis" = Ghana cedis marker

Text: "${text}"

Return ONLY valid JSON — no markdown:
{"amount":0,"confidence":"high|medium|low"}`,
        }],
      });
      const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      console.log("[Parse amount]", parsed);
      return NextResponse.json(parsed);
    } catch (e) {
      console.error("[Parse amount] error:", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  // ── Full parse (both route + amount) ─────────────────────────
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `You are a trip log parser for trotro (minibus) drivers in Ghana.
The driver or mate speaks after completing a trip to log the TOTAL SALES collected for that trip (fares from all passengers combined). The amount is not a single passenger fare — it is total revenue for the whole trip run, so values of 20–500 GHS are normal. Your job is to extract the route and the total sales amount from the transcript, correcting ASR distortions as needed.

## Known Ghana Place Names
Kumasi: Tech, KNUST, Adum, Abuakwa, Ahodwo, Asafo, Ayeduase, Santase, Tanoso, Amakom, Maxima, Ejisu, Effiduasi, Agogo, Angola, Suame, Kejetia, Tafo, Bantama, Nhyiaeso, Danyame, Bomso, Patasi, Dichemso, Asokwa, Oforikrom, Kotei, Ayigya, Deduako, Roman Hill, Kumasi Central
Accra: Accra, Madina, Circle, Kaneshie, Lapaz, Achimota, Legon, Adenta, Tema, Kasoa, Weija, Spintex, Osu, Labadi, Nungua, Teshie, Dansoman, Mallam, Odorkor, Abeka, Darkuman, Tesano, Adabraka
Other: Kumasi, Accra, Takoradi, Cape Coast, Koforidua, Sunyani, Tamale, Techiman, Obuasi, Konongo

## ASR Distortion Table — always apply these corrections
Place names:
- "Deka", "Teka", "Teg", "Tek" → Tech (KNUST area, Kumasi)
- "tubu", "Tubu", "Dubu" → Adum
- "Figirase", "Efigiras", "Efiduas", "Fiduase" → Effiduasi
- "Magsima", "Maksima", "Magsema" → Maxima
- "Anor)ga", "Anorgagyan", "Anorgagyanhyen", "Angloga", "Anloga Junction", "Angloga Junction" → Angola (Kumasi bus station)
- "Santa ase", "Santaase", "Santase" → Santase
- "Ta no so", "Tano so", "Tanoso" → Tanoso
- "Egyeso", "Ejeso", "Egyesu" → Ejisu
- "Agogo" may be misheard for "Abuakwa" and vice-versa — trust word order (first place = origin)
- Any fragment matching "Roman" → Roman Hill

Numbers (Twi, pidgin, and ASR-mangled):
- "baako", "ɛkɔ", "eko" → 1
- "abien", "mmienu", "too", "tu", "ntoo" → 2
- "abiɛsa", "abiesa", "nsa", "tri", "tre" → 3
- "anan", "nnan", "fo", "foa" → 4
- "enum", "ɛnum", "fai", "faifu", "faiv", "fayf" → 5
- "asia", "nsia", "sikis", "ses", "sies" → 6
- "ason", "nson", "sebi", "seben", "sebem", "seven" → 7
- "awɔtwe", "ntwe", "eit", "eit" → 8
- "akron", "nkron", "nain", "nayn" → 9
- "du", "edu", "ten" → 10
- "aduonu", "twenti", "twenty" → 20
- "aduasa", "thirty" → 30
- "aduanan", "forty" → 40
- "aduonum", "fifty" → 50

When you see "sidis", "ntisidis", "seadis", "cedis", "cedi", "ghs", "ghana cedi" — that's the currency marker. The word(s) immediately before it are the amount.

## Extraction rules
- route: Use the closest matching known place name for each location. Format as "Origin–Destination". If only one place mentioned, use it alone (e.g. "Adum"). NEVER return "Unknown route" — if you see any recognisable place fragment, use your best match. Only use "Unknown route" if the text contains zero place-like words.
- amount: Total trip sales in GHS. Parse English numerals, Twi number words, and ASR approximations using the table above. Values of 20–500 GHS are normal for a trotro trip. Return an integer or decimal. If genuinely no amount present, use 0.
- confidence: "high" = both clear, "medium" = one uncertain, "low" = both guessed.

Text: "${text}"

Respond with ONLY valid JSON. No explanation. No markdown.
Example: {"route":"Santase–Adum","amount":5,"confidence":"high"}`,
        },
      ],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
    console.log("[Anthropic Parse] raw:", raw);

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[Anthropic Parse] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
