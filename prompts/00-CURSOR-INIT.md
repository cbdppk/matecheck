# MateCheck — Cursor Initialization Prompts
**Run these in order. Do not skip. Do not combine.**

---

## INIT PROMPT 1 — Scaffold the project
**Who runs this:** You (ppk)
**When:** First thing. Hour 0:00.
**Where:** Cursor chat, new project folder

```
You are helping me build MateCheck — a mobile-first trotro revenue tracker for a Ghana hackathon.

Read these project documents first before doing anything:
- docs/00-START-HERE.md
- .agents/skills/nextjs-mobile-flow/SKILL.md

Then do exactly this:

1. Initialize a Next.js 15 project with:
   - App Router
   - TypeScript
   - Tailwind CSS
   - ESLint

2. Install these packages:
   @neondatabase/serverless
   zod
   clsx

3. Create this exact folder structure:
   .agents/skills/nextjs-mobile-flow/SKILL.md
   .agents/skills/schema-first-analysis/SKILL.md
   .agents/skills/ghana-nlp-integration/SKILL.md
   .agents/skills/demo-readiness-reviewer/SKILL.md
   docs/00-START-HERE.md
   docs/01-COMMIT-PLAN.md
   docs/02-PERSON-B.md
   docs/03-PERSON-C.md
   lib/contracts.ts
   lib/prompts.ts
   lib/sampleData.ts
   lib/db.ts
   app/driver/page.tsx
   app/owner/page.tsx
   app/owner/[vehicleId]/page.tsx
   app/owner/[vehicleId]/dispute/page.tsx
   app/api/voice-log/route.ts
   app/api/summary/route.ts
   app/api/dispute/route.ts
   components/driver/VoiceLogButton.tsx
   components/owner/VehicleCard.tsx
   components/owner/TripList.tsx
   components/owner/EarningsBar.tsx
   components/ui/LoadingSpinner.tsx

4. Create `.env.local` with these empty variables:
   DATABASE_URL=
   ANTHROPIC_API_KEY=
   GHANA_NLP_API_KEY=

5. Add a clear README.md that explains:
   - what MateCheck is
   - how to run it
   - what the env vars are

6. Make sure `npm run dev` runs without errors.

Definition of done:
- Project runs on localhost:3000
- All folders exist
- No TypeScript errors
- .env.local has the variable names but empty values

Return:
1. Exact files created
2. Any issues
3. What to do next
```

---

## INIT PROMPT 2 — Write the shared contract
**Who runs this:** Teammate B
**When:** Immediately after Init 1 is done and committed.
**Where:** Cursor chat, on the `feat/contract` branch

```
Read these files first:
- docs/00-START-HERE.md
- .agents/skills/schema-first-analysis/SKILL.md

You are working on Phase 1 — Shared Contract.
Branch: feat/contract

Task:
Write the complete contents of `lib/contracts.ts`.

It must contain exactly these TypeScript types with no extras:
- Vehicle
- Trip
- DailySummary
- VoiceLogResponse
- SummaryResponse
- DisputeResponse

Copy the exact type definitions from docs/00-START-HERE.md under "The shared contract".
Do not invent new fields. Do not change field names. Do not add generics.

Also write `lib/sampleData.ts` with:
- 3 sample vehicles (real Ghana plates, real Accra routes)
- 14 days of trip data for each vehicle
- realistic amounts: GHS 15–35 per trip, 6–12 trips per day
- one vehicle with a low-earnings day on the most recent date (triggers anomaly)
- export: sampleVehicles, sampleTrips, sampleSummaries

Also write `lib/prompts.ts` with these exported prompt template strings:
- VOICE_PARSE_PROMPT — instructions to Claude to extract route + amount from Twi transcript
- DAILY_SUMMARY_PROMPT — instructions to Claude to write a 2-sentence Twi summary of a driver's day
- DISPUTE_PROMPT — instructions to Claude to mediate a dispute between owner claim and logged data

Files you may touch:
- lib/contracts.ts
- lib/sampleData.ts
- lib/prompts.ts

Files you must not touch:
- app/
- components/
- anything else

Definition of done:
- lib/contracts.ts exports all 6 types
- lib/sampleData.ts exports sampleVehicles, sampleTrips, sampleSummaries
- lib/prompts.ts exports 3 prompt strings
- No TypeScript errors
- No changes to any other file

Return:
1. Complete contents of all 3 files
2. Confirmation of no TypeScript errors
```

---

## INIT PROMPT 3 — Set up Neon DB
**Who runs this:** You (ppk)
**When:** After Init 2 is committed.
**Where:** Cursor chat, main branch or `feat/scaffold`

```
Read this file first:
- .agents/skills/schema-first-analysis/SKILL.md

Task:
Write `lib/db.ts` — the database connection and schema setup for Neon PostgreSQL.

Requirements:
1. Use `@neondatabase/serverless` with the DATABASE_URL from process.env
2. Export a `sql` tagged template literal function for queries
3. Export a `createTables()` function that creates these tables if they don't exist:

vehicles table:
  id TEXT PRIMARY KEY,
  plate TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  route TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()

trips table:
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  amount NUMERIC(10,2) NOT NULL,
  route TEXT NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  raw_voice_text TEXT,
  confidence TEXT DEFAULT 'high' CHECK (confidence IN ('high','medium','low'))

daily_summary table:
  vehicle_id TEXT NOT NULL,
  date DATE NOT NULL,
  total NUMERIC(10,2) DEFAULT 0,
  trip_count INT DEFAULT 0,
  avg_per_trip NUMERIC(10,2) DEFAULT 0,
  ai_note TEXT,
  anomaly BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (vehicle_id, date)

4. Export a `seedDatabase()` function that:
   - reads from lib/sampleData.ts
   - inserts all sample vehicles and trips if tables are empty
   - is safe to call multiple times (upsert or check-first)

5. Create app/api/init/route.ts that:
   - calls createTables() then seedDatabase()
   - returns { success: true, message: "DB ready" }
   - is a GET endpoint

Files you may touch:
- lib/db.ts
- app/api/init/route.ts

Files you must not touch:
- lib/contracts.ts (do not change types)
- lib/sampleData.ts

Definition of done:
- lib/db.ts exports sql, createTables, seedDatabase
- Calling GET /api/init seeds the database
- No TypeScript errors
```

---

*After these 3 prompts are done and committed, the team can work in parallel. See 01-COMMIT-PLAN.md for what comes next.*
