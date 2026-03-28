# SKILL: nextjs-mobile-flow

## Purpose
Build mobile-first Next.js App Router screens that work on Ghana mobile networks and devices.

## Use when
Building any page component in MateCheck: driver log, owner dashboard, vehicle detail, dispute page.

## Inputs
- lib/contracts.ts — check prop types before building
- lib/sampleData.ts — use for local development
- docs/00-START-HERE.md — check which screen you own

## Standards
- Mobile first. Target 375px width minimum.
- Touch targets: 48px minimum height for all buttons.
- Font sizes: headings 24px+, body 16px+. Never below 14px.
- Loading states: every async action must show a loading indicator.
- Error states: every fetch must have a visible error fallback.
- Ghana-specific: support Twi text rendering (standard Unicode, no special fonts needed).

## Process
1. Read lib/contracts.ts to understand the data shape you are working with.
2. Build with sample data first from lib/sampleData.ts.
3. Add the API call only after the UI renders correctly with sample data.
4. Test at 375px width in browser devtools.
5. Confirm all loading + error states are visible.

## Output
- A page or component that renders correctly on mobile
- Uses TypeScript with proper types from lib/contracts.ts
- Has loading state (spinner or skeleton)
- Has error state (red message)
- Has empty state where applicable

## Do not
- Use any chart library unless it is already installed
- Add new npm packages without asking ppk
- Change lib/contracts.ts
- Build screens you do not own (see docs/00-START-HERE.md)
- Use localStorage for anything that should be in the DB
- Skip error handling
- Use inline styles — Tailwind only

---
---

# SKILL: schema-first-analysis

## Purpose
Build API routes in Next.js that are strict about input validation, DB interaction, and output shape.

## Use when
Building any route handler in app/api/. Especially: voice-log, summary, dispute.

## Inputs
- lib/contracts.ts — the response type this route must return
- lib/db.ts — the DB connection and helper functions
- lib/prompts.ts — the Claude prompt templates

## Standards
- Every route must validate input with Zod before doing anything else.
- Every DB call must be wrapped in try/catch.
- Every Claude API call must be wrapped in try/catch with a graceful fallback.
- Response shape must exactly match the TypeScript type in lib/contracts.ts.
- Never return an undocumented shape.

## Process
1. Read lib/contracts.ts to identify the exact return type.
2. Write the Zod validation schema for the input.
3. Write the DB queries needed.
4. Write the Claude API call using the prompt from lib/prompts.ts.
5. Map the results to the contract type.
6. Return the typed response.

## Output
A Next.js Route Handler that:
- Accepts POST or GET
- Validates input with Zod
- Returns exactly the shape in lib/contracts.ts
- Has try/catch on all external calls
- Returns clear error messages on failure

## Do not
- Change lib/contracts.ts response shapes
- Return extra fields not in the contract
- Skip Zod validation
- Silently swallow errors
- Use any ORM — raw SQL with @neondatabase/serverless only
- Mix AI logic and DB logic in the same try/catch block

---
---

# SKILL: ghana-nlp-integration

## Purpose
Integrate GhanaNLP APIs for Twi speech recognition (ASR) and text-to-speech (TTS) and translation.

## Use when
- Processing voice input from drivers (ASR: speech → Twi text)
- Generating audio confirmations for drivers (TTS: Twi text → audio)
- Translating English → Twi or Twi → English for the dispute resolver

## Inputs
- GHANA_NLP_API_KEY from process.env
- GhanaNLP base URL: https://translation.ghananlp.org/v1/

## API reference

### ASR (Speech to Text)
```
POST https://translation.ghananlp.org/v1/asr
Headers:
  Ocp-Apim-Subscription-Key: [API_KEY]
  Content-Type: multipart/form-data
Body:
  file: [audio blob]
  language: "tw"  (Twi/Akan)
Response: { transcript: "..." }
```

### TTS (Text to Speech)
```
POST https://translation.ghananlp.org/v1/tts
Headers:
  Ocp-Apim-Subscription-Key: [API_KEY]
  Content-Type: application/json
Body: { "text": "...", "language": "tw" }
Response: base64 audio string
```

### Translate
```
POST https://translation.ghananlp.org/v1/translate
Headers:
  Ocp-Apim-Subscription-Key: [API_KEY]
  Content-Type: application/json
Body: { "in": "en", "out": "tw", "sentence": "..." }
Response: { translation: "..." }
```

## Standards
- Always wrap GhanaNLP calls in try/catch
- If GhanaNLP fails, the feature degrades gracefully — the app still works
- Never block a DB insert on a GhanaNLP failure
- Log GhanaNLP errors to console but do not surface them to the user as crashes

## Process
1. Check GHANA_NLP_API_KEY is available before calling
2. Make the API call
3. On success: use the result
4. On failure: log and proceed with fallback (text input, no audio, English only)

## Output
- Twi transcript string from ASR
- Base64 audio from TTS (to be played with new Audio(dataUrl).play())
- Translated string from Translate endpoint

## Do not
- Block the main flow on GhanaNLP failures
- Expose the raw API error to the user
- Store audio blobs in the DB — only store transcripts
- Assume the API key format — read docs at translation.ghananlp.org/apis

---
---

# SKILL: demo-readiness-reviewer

## Purpose
Review the MateCheck app before demo freeze to confirm it is stable, complete, and demo-ready.

## Use when
- At Phase 5 (Hour 4:45) before demo freeze
- Before ppk calls the deploy stable
- Before C begins rehearsing the demo script

## Inputs
- docs/00-START-HERE.md — specifically the Demo Moment section
- The live deployed URL
- The demo script in PERSON-C.md

## Standards
- The demo must work end-to-end on a mobile browser without any console errors
- Every step in the demo script must be testable with pre-seeded data
- Fallbacks must exist for GhanaNLP and Claude failures
- The dispute resolver must return a result every time
- Loading states must be visible — no blank screens during API calls

## Process
1. Open the deployed URL on a real mobile device or 375px devtools.
2. Walk through every step of the demo script.
3. Note any step that fails or looks broken.
4. Check if fallbacks work (disable network temporarily for AI APIs).
5. Run the dispute scenario with known data.

## Output
A done-check report in this format:

Status: Done / Partial / Not done

Working:
- [list]

Broken:
- [list]

Risky (might fail on stage):
- [list]

Must fix before demo:
- [max 3 items]

## Do not
- Suggest new features during demo freeze
- Suggest refactors during demo freeze
- Mark anything as done unless you personally tested it
- Accept "it works on my machine" — test the Vercel deploy only
