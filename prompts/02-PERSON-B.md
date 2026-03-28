# MateCheck — Teammate B Prompts
**You are Person B — AI + Data + GhanaNLP Lead**
**Share this file with Teammate B. They run these prompts in Cursor on their machine.**

---

## WAIT SIGNAL FOR B

```
WAIT until ppk (Person A) tells you:
✅ "Init 1, 2, 3 are done and pushed to main"

Then clone the repo and start on your branch:
  git checkout main
  git pull origin main
  git checkout -b feat/api
```

---

## B PROMPT 1 — Voice log API route
**Phase 2B · Branch: `feat/api` · Hour 0:45**
**Start when:** ppk confirms the scaffold and contract are on main

```
Read these files first:
- docs/00-START-HERE.md
- lib/contracts.ts
- lib/prompts.ts
- lib/db.ts
- .agents/skills/schema-first-analysis/SKILL.md
- .agents/skills/ghana-nlp-integration/SKILL.md

You are working on Phase 2B — API + AI processing.
Branch: feat/api

Task 1: Build `app/api/voice-log/route.ts`

This POST endpoint receives:
  { vehicleId: string, rawText: string, amount?: number, route?: string }

It must:
1. Validate input with Zod:
   - vehicleId: required string
   - rawText: optional string
   - amount: optional number
   - route: optional string

2. If rawText is provided, call Claude API to parse it:
   - Use the VOICE_PARSE_PROMPT from lib/prompts.ts
   - Append: "Transcript: [rawText]"
   - Claude must return JSON: { amount: number, route: string, confidence: "high"|"medium"|"low" }
   - Use model: claude-sonnet-4-6
   - Parse the JSON from Claude's response safely

3. If amount and route are provided manually, skip Claude parsing and set confidence = "high"

4. If neither Claude result nor manual input is usable, return:
   { success: false, error: "Could not understand trip details" }

5. Generate trip id: `trip_${Date.now()}_${Math.random().toString(36).slice(2,8)}`

6. Insert trip into Neon `trips` table

7. Call GhanaNLP TTS to generate an audio confirmation in Twi:
   - Text: "Akwaaaba. Wo kwan so wɔ [route], GHS [amount] atwam" (adjust as needed)
   - GhanaNLP TTS endpoint: POST https://translation.ghananlp.org/v1/tts
   - Headers: { "Cache-Control": "no-cache", "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": process.env.GHANA_NLP_API_KEY }
   - Body: { "text": "...", "language": "tw" }
   - Returns base64 audio — pass to client as confirmationTwi

8. Return VoiceLogResponse (from lib/contracts.ts):
   { success: true, trip: Trip, confirmationTwi: base64AudioString }

Error handling:
- If Claude API fails → use manual input if available, else return error
- If GhanaNLP TTS fails → skip audio, still return success with trip
- If DB insert fails → return { success: false, error: "Database error" }

Files you may touch:
- app/api/voice-log/route.ts

Files you must not touch:
- lib/contracts.ts
- app/ pages
- components/

Definition of done:
- Route accepts POST with Zod validation
- Claude parses Twi text into amount + route
- Trip is inserted into Neon
- GhanaNLP TTS call is attempted (graceful failure is fine)
- Returns VoiceLogResponse shape exactly matching lib/contracts.ts
- No TypeScript errors

Return:
1. Short plan
2. Implementation
3. Any blocked items
```

---

## B PROMPT 2 — Daily summary API route
**Phase 2B continued · Branch: `feat/api`**
**Start when:** B Prompt 1 is working locally

```
Read these files first:
- lib/contracts.ts
- lib/prompts.ts
- .agents/skills/schema-first-analysis/SKILL.md

Task:
Build `app/api/summary/route.ts`

This POST endpoint receives:
  { vehicleId: string, date: string }  (date = YYYY-MM-DD)

It must:
1. Validate input with Zod

2. Query Neon for all trips for this vehicle on this date:
   SELECT * FROM trips WHERE vehicle_id = $1 AND DATE(logged_at) = $2

3. Compute:
   - total = sum of all trip amounts
   - tripCount = number of trips
   - avgPerTrip = total / tripCount

4. Query the last 7 days of daily totals for this vehicle to check anomaly:
   SELECT date, SUM(amount) as daily_total FROM trips
   WHERE vehicle_id = $1 AND logged_at >= NOW() - INTERVAL '7 days'
   GROUP BY DATE(logged_at)
   Anomaly = true if today's total < 70% of the 7-day average

5. Call Claude API with DAILY_SUMMARY_PROMPT + trip list:
   - Ask Claude to write a 2-sentence summary in Twi AND English
   - Return JSON: { twi: "...", en: "..." }
   - Model: claude-sonnet-4-6

6. Upsert daily_summary table with computed values + Claude note

7. Return SummaryResponse from lib/contracts.ts

Files you may touch:
- app/api/summary/route.ts

Files you must not touch:
- lib/contracts.ts
- other API routes

Definition of done:
- Route computes correct totals from DB
- Anomaly flag works correctly
- Claude generates Twi + English summary
- Returns SummaryResponse shape
- No TypeScript errors
```

---

## B PROMPT 3 — Dispute resolver (the demo killer feature)
**Phase 3 · Branch: `feat/dispute` · Hour 2:30**
**Start when:** feat/api is merged to main by ppk

```
Read these files first:
- docs/00-START-HERE.md
- lib/contracts.ts
- lib/prompts.ts
- .agents/skills/schema-first-analysis/SKILL.md
- .agents/skills/ghana-nlp-integration/SKILL.md

You are working on Phase 3 — Dispute resolver.
Branch: feat/dispute

This is the feature that will WIN the hackathon demo.
Build it carefully.

Task 1: Build `app/api/dispute/route.ts`

This POST endpoint receives:
  {
    vehicleId: string,
    date: string,           // YYYY-MM-DD
    ownerClaim: string,     // natural language: "Driver said 80 cedis but I see 60"
    claimedAmount?: number  // optional explicit number
  }

It must:
1. Validate input with Zod

2. Fetch all trips for this vehicle + date from Neon

3. Compute loggedTotal from trips

4. If claimedAmount not provided, try to extract it from ownerClaim using Claude:
   Ask: "Extract the claimed amount in GHS from this text: [ownerClaim]"
   Return number or null

5. Call Claude with DISPUTE_PROMPT + full context:
   - Pass: vehicleId, date, loggedTotal, claimedAmount, all trip records, ownerClaim
   - Claude must return JSON:
     {
       analysisEn: "2-3 sentence neutral analysis in English",
       analysisTwi: "2-3 sentence neutral analysis in Twi",
       verdict: "matches" | "gap_explained" | "gap_unexplained"
     }
   - Model: claude-sonnet-4-6

6. If GhanaNLP translation is faster than Claude Twi generation,
   alternatively: generate English analysis with Claude, then translate to Twi via
   GhanaNLP Translate endpoint:
   POST https://translation.ghananlp.org/v1/translate
   Body: { "in": "en", "out": "tw", "sentence": analysisEn }

7. Return DisputeResponse from lib/contracts.ts

Task 2: Build `app/owner/[vehicleId]/dispute/page.tsx`

This page:
1. Shows vehicle plate + date at top
2. Shows logged total: "Logged today: GHS [total]"
3. Shows a textarea: "Describe the dispute" with placeholder in Twi + English
4. Shows a "Get AI Verdict" button
5. On submit: POST /api/dispute
6. Loading state: "AI is reviewing the records..." (3–5 seconds typical)
7. Result card shows:
   - Verdict badge: "Match ✓" (green) / "Gap — explained" (amber) / "Gap — unexplained" (red)
   - English analysis paragraph
   - Twi analysis paragraph
   - "Logged: GHS X · Claimed: GHS Y" comparison row

Files you may touch:
- app/api/dispute/route.ts
- app/owner/[vehicleId]/dispute/page.tsx

Files you must not touch:
- lib/contracts.ts
- other API routes
- components/ (C owns visual polish)

Definition of done:
- POST /api/dispute returns DisputeResponse
- Page renders and submits the dispute
- AI returns a verdict in both Twi and English
- Loading state is visible
- Result card displays all 3 verdict types correctly
- No TypeScript errors

Return:
1. Short plan
2. Exact files changed
3. Implementation
4. Any blocked items
```

---

## B PROMPT 4 — Done check
**Hour 3:30 · Before telling ppk you are done**

```
Read these files:
- docs/00-START-HERE.md
- lib/contracts.ts

Review all API routes you built:
- app/api/voice-log/route.ts
- app/api/summary/route.ts
- app/api/dispute/route.ts

Return your review in this format:

Status: Done / Partial / Not done

What each route does:
- voice-log: [what it does]
- summary: [what it does]
- dispute: [what it does]

What is missing or broken:
- [list]

What is risky (API failures, slow responses):
- [list]

Does every route return exactly the types in lib/contracts.ts:
- Yes / No [explain any differences]

What should ppk know before integration:
- [any env vars needed, any edge cases]
```

---

## B SIGNAL TO PPK

When all your prompts are done and working locally:

```
Tell ppk (Person A):
"B DONE — feat/api and feat/dispute are pushed.
Routes working: /api/voice-log, /api/summary, /api/dispute
Env vars needed: ANTHROPIC_API_KEY, GHANA_NLP_API_KEY, DATABASE_URL
Known issue: [anything fragile]
Ready for you to merge."
```

---

*B: your job is AI and data correctness. Do not touch pages or components. Keep contracts.ts unchanged.*
