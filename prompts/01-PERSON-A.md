# MateCheck — Your (ppk) Build Prompts
**You are Person A — Product + Integration Lead**
**Run these in the order shown. One prompt at a time.**

---

## YOUR PROMPT A1 — Driver page shell
**Phase 2A · Branch: `feat/driver` · Hour 0:45**
**Start when:** Init Prompts 1, 2, 3 are all committed to main

```
Read these files first:
- docs/00-START-HERE.md
- lib/contracts.ts
- .agents/skills/nextjs-mobile-flow/SKILL.md

You are working on Phase 2A — Driver entry screen.
Branch: feat/driver

Task:
Build `app/driver/page.tsx` — the screen a driver uses to log a trip.

The page must:
1. Show a vehicle selector — dropdown using sampleVehicles from lib/sampleData.ts
2. Show the selected vehicle's default route as a read-only badge
3. Show a big green microphone button labeled "Tap to speak" (Twi: "Kasa")
4. Below the mic button, show a text fallback input: "Or type trip details"
5. Show a manual amount input (GHS) and route text input as secondary fallback
6. Show a "Log Trip" submit button
7. On submit: POST to /api/voice-log with { vehicleId, rawText, amount?, route? }
8. On success: show a green confirmation card: "Trip logged ✓" with the amount
9. On error: show a red error message

The Web Speech API mic button:
- Use `window.SpeechRecognition || window.webkitSpeechRecognition`
- Set language to "ak" (Twi/Akan) as first attempt
- On result: populate the text fallback input with the transcript
- If SpeechRecognition not supported: hide mic button, show text input only

Also build `components/driver/VoiceLogButton.tsx`:
- Accepts: onResult(text: string), onError(msg: string)
- Shows animated pulse ring when recording
- Shows "Listening..." text while active

Files you may touch:
- app/driver/page.tsx
- components/driver/VoiceLogButton.tsx

Files you must not touch:
- lib/contracts.ts
- app/api/ (API routes are owned by Person B)
- app/owner/

Definition of done:
- Page renders without errors
- Vehicle selector shows 3 sample vehicles
- Mic button exists and attempts to record
- Text fallback input works
- Form POSTs to /api/voice-log (will 404 until B finishes — that is fine)
- Loading state shows during POST
- Success and error states render
- Works on mobile viewport (375px wide)

Return:
1. Short plan
2. Exact files changed
3. Implementation
4. Anything blocked
```

---

## YOUR PROMPT A2 — Owner dashboard shell
**Phase 2C · Branch: `feat/owner` · Hour 1:30**
**Start when:** Contract is merged (feat/contract → main)

```
Read these files first:
- docs/00-START-HERE.md
- lib/contracts.ts
- lib/sampleData.ts
- .agents/skills/nextjs-mobile-flow/SKILL.md

You are working on Phase 2C — Owner dashboard.
Branch: feat/owner

Task:
Build the owner-facing screens using SAMPLE DATA ONLY (no live API calls yet).

1. `app/owner/page.tsx` — Fleet overview
   - Heading: "Your Fleet" with date (today)
   - List of VehicleCard components, one per vehicle in sampleVehicles
   - Each card links to /owner/[vehicleId]

2. `components/owner/VehicleCard.tsx`
   Props: vehicle: Vehicle, summary: DailySummary
   Shows:
   - Plate number (large, bold)
   - Route badge (e.g. "Circle–Madina")
   - Today's total: "GHS 240"
   - Trip count: "8 trips"
   - Anomaly badge: red pill "Low earnings" if summary.anomaly === true
   - Tap/click → navigate to /owner/[vehicleId]

3. `app/owner/[vehicleId]/page.tsx` — Single vehicle view
   - Vehicle plate + route at top
   - Today's total + trip count
   - EarningsBar component (7 days)
   - "Get AI Summary" button → POST /api/summary (stub for now, show mock result)
   - TripList component

4. `components/owner/EarningsBar.tsx`
   Props: summaries: DailySummary[]
   - Simple 7-bar chart using pure CSS div widths (no chart library needed)
   - Each bar shows GHS total on hover
   - Today's bar highlighted in green
   - Anomaly bars shown in red

5. `components/owner/TripList.tsx`
   Props: trips: Trip[]
   - List of trip rows: time · route · GHS amount · confidence badge
   - Sorted newest first
   - Empty state: "No trips logged today"

Use sampleData throughout. Do not call any API routes.
All data must be importable from lib/sampleData.ts.

Files you may touch:
- app/owner/page.tsx
- app/owner/[vehicleId]/page.tsx
- components/owner/VehicleCard.tsx
- components/owner/EarningsBar.tsx
- components/owner/TripList.tsx

Files you must not touch:
- lib/contracts.ts
- lib/sampleData.ts (read only)
- app/driver/
- app/api/

Definition of done:
- /owner shows 3 vehicle cards from sample data
- One vehicle shows anomaly badge
- Clicking a card goes to /owner/[vehicleId]
- Vehicle detail shows bar chart and trip list
- All screens work on mobile (375px)
- No TypeScript errors

Return:
1. Short plan
2. Exact files changed
3. Implementation
4. Anything blocked
```

---

## YOUR PROMPT A3 — Integration: wire real API to UI
**Phase 3 Integration · Branch: `feat/integration` · Hour 2:30**
**Start when:** feat/api is merged (B is done with /api/voice-log and /api/summary)

```
Read these files first:
- docs/00-START-HERE.md
- lib/contracts.ts
- app/api/voice-log/route.ts
- app/api/summary/route.ts
- .agents/skills/nextjs-mobile-flow/SKILL.md

You are working on Phase 3 — Integration.
Branch: feat/integration
Depends on: feat/driver merged, feat/owner merged, feat/api merged

Task:
Replace all sample data usage with live API calls.

1. `app/driver/page.tsx`:
   - Voice transcript now POSTs to /api/voice-log with { vehicleId, rawText }
   - On success: show trip from VoiceLogResponse
   - Play confirmationTwi audio if present (use Web Audio API: `new Audio(dataUrl).play()`)

2. `app/owner/page.tsx`:
   - Fetch vehicles from Neon via a new Server Component fetch
   - Create app/api/vehicles/route.ts: GET → returns all vehicles with today's summary
   - Replace sampleVehicles with fetched data

3. `app/owner/[vehicleId]/page.tsx`:
   - Fetch live trips for this vehicle from Neon
   - Create app/api/trips/route.ts: GET ?vehicleId=X&date=YYYY-MM-DD → returns Trip[]
   - "Get AI Summary" button now calls /api/summary and shows real AI result

4. Ensure the happy path works end-to-end:
   Driver logs trip → appears immediately on owner dashboard
   (Use a 5-second polling interval on the owner page OR use router.refresh())

New API routes you may create:
- app/api/vehicles/route.ts
- app/api/trips/route.ts

Files you may touch:
- app/driver/page.tsx
- app/owner/page.tsx
- app/owner/[vehicleId]/page.tsx
- app/api/vehicles/route.ts (new)
- app/api/trips/route.ts (new)

Files you must not touch:
- lib/contracts.ts
- app/api/voice-log/route.ts (owned by B)
- app/api/summary/route.ts (owned by B)
- app/api/dispute/route.ts (owned by B)
- components/ (owned by C at this stage)

Definition of done:
- Driver page POSTs real voice/text to /api/voice-log
- Trip appears in Neon DB
- Owner page shows live trip count
- AI Summary button returns real Claude output
- Happy path works: log trip → see it on owner dashboard
- No TypeScript errors

Return:
1. Short plan
2. Exact files changed
3. Implementation
4. Anything blocked
```

---

## YOUR PROMPT A4 — Vercel deploy + smoke test
**Phase 4B Deploy · Hour 4:15**
**Start when:** Polish branch is ready from C

```
Read this file:
- docs/00-START-HERE.md

Task:
Deploy MateCheck to Vercel and run a full smoke test.

Steps:
1. Confirm all environment variables are set in Vercel dashboard:
   - DATABASE_URL (from Neon project settings)
   - ANTHROPIC_API_KEY
   - GHANA_NLP_API_KEY

2. Run: vercel --prod

3. After deploy, test this exact demo path:
   a. Open the deployed URL on a mobile device
   b. Go to /driver
   c. Select vehicle "GR-1234-22"
   d. Tap mic, say "Circle to Madina, twenty cedis"
   e. Confirm trip logs
   f. Go to /owner
   g. Confirm the vehicle shows the new trip
   h. Click into the vehicle
   i. Click "Get AI Summary"
   j. Confirm AI note appears in Twi
   k. Go to /owner/[vehicleId]/dispute
   l. Type: "Driver says he made 80 cedis but I see 60"
   m. Confirm AI responds with Twi + English breakdown

4. If anything fails, note it and fix before calling it stable.

5. Write the deploy URL in docs/00-START-HERE.md under a new "Live URL" section.

Return:
1. Deploy URL
2. Smoke test results (pass/fail per step)
3. Any fixes made
4. Any known issues for the judges to avoid
```

---

## YOUR PROMPT A5 — Done check before demo freeze
**Phase 5 Gate · Hour 4:45**

```
Read these files:
- docs/00-START-HERE.md
- lib/contracts.ts

Review the entire MateCheck project against the hackathon MVP.

Return your review in this exact format:

Status:
- Done / Partial / Not done

What is complete:
- [list every working feature]

What is missing or broken:
- [list anything not working]

What is risky for the demo:
- [list fragile things]

What must be fixed before demo freeze:
- [list only critical fixes]

Does this still match the product scope from docs/00-START-HERE.md:
- Yes / No / Partially

Does this still match lib/contracts.ts:
- Yes / No

After your review, list exactly 3 things to fix.
Do not suggest new features.
Do not suggest refactors.
Only critical demo path stability.
```

---

*Keep this file open throughout the build. One prompt at a time. Never skip ahead.*
