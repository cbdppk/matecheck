# MateCheck — Teammate C Prompts
**You are Person C — UI Polish + Demo Lead**
**Share this file with Teammate C.**

---

## WAIT SIGNAL FOR C

```
WAIT until ppk (Person A) tells you:
✅ "feat/driver and feat/owner are merged to main"
(This will be around Hour 1:30–2:00)

Until then, do this offline work:
1. Create the 5-slide pitch deck (template below)
2. Write the demo script (template below)
3. Seed the demo data manually to understand the product

Then clone the repo and start:
  git checkout main
  git pull origin main
  git checkout -b feat/polish
```

---

## C OFFLINE WORK (Hours 0:00–1:30)

### Pitch deck (5 slides only)

**Slide 1 — The problem**
Headline: "Ghana's trotro owners are flying blind"
Body: "Over 80,000 commercial vehicles in Accra. Zero software tracking driver revenue. Owners lose 20–40% to unverified cash."

**Slide 2 — Demo (live)**
Just the title: "Watch it work →"
(You will live demo here)

**Slide 3 — The solution**
Headline: "MateCheck — AI-powered trip logging in Twi"
Three bullets:
- Driver speaks in Twi → AI logs the trip
- Owner sees real-time earnings on their dashboard
- AI mediates disputes in Twi and English

**Slide 4 — Market**
Headline: "A market hiding in plain sight"
Body: 80,000+ vehicles in Greater Accra · GHS 5/vehicle/month = GHS 400k MRR at 1% penetration · Powered by GhanaNLP + Claude AI

**Slide 5 — Team + stack**
Team names + Next.js · Neon DB · Claude AI · GhanaNLP

Keep all slides under 30 words. No bullet soup. One big idea per slide.

---

### Demo script (memorize this)

```
"Every trotro owner in Ghana has the same problem.
They give their vehicle to a driver in the morning.
They don't know how much was collected until the driver tells them at night.
They have to trust the driver completely. That's a broken system.

We built MateCheck.

[Open app on phone]

The driver opens their phone, taps the mic, and speaks in Twi:
"Circle to Madina, twenty cedis."

[Show trip logged on screen]

That's it. The trip is recorded. The owner sees it immediately.

[Switch to owner view]

The owner opens the dashboard. GHS 240 collected today. 8 trips.
And this vehicle — [tap anomaly] — is flagged. Earnings are 40% below average.

Now — the best part.

[Open dispute page]

The owner suspects a problem. They type: "Driver says he made 80 cedis but I only see 60."

[Click Get AI Verdict]

AI reviews every trip log. It responds — in Twi and English — with a neutral breakdown.
No argument needed. The records speak.

This is MateCheck.
Built in 6 hours. Solving a problem that 80,000 vehicle owners face every single day."
```

---

## C PROMPT 1 — Polish all components
**Phase 4A · Branch: `feat/polish` · Hour 1:30 (clone ready) → Start polishing Hour 2:00**
**Start when:** ppk says feat/driver + feat/owner are merged

```
Read these files first:
- docs/00-START-HERE.md
- lib/contracts.ts
- .agents/skills/nextjs-mobile-flow/SKILL.md

You are working on Phase 4A — UI Polish.
Branch: feat/polish

Your job is to make every screen look excellent on mobile.
Do NOT change any logic. Only improve visual quality.

Polish these components:

1. `app/page.tsx` — Landing page (if it's just a skeleton, build it now)
   - Full screen with two big tap areas: "I'm a Driver" and "I'm an Owner"
   - Show the MateCheck logo/wordmark at top
   - Ghana flag colors as accent (red #CE1126, gold #FCD116, green #006B3F)
   - Bottom tagline: "Track. Trust. Get paid right."

2. `app/driver/page.tsx` — Driver screen
   - Clean, bold typography
   - Mic button must be large (at least 80px × 80px), centered, with a pulsing animation when recording
   - Green on-brand color for the button
   - Confirmation card: green background, white text, checkmark

3. `app/owner/page.tsx` — Fleet overview
   - Card grid, 1 column on mobile
   - Anomaly badge: red, bold, visible

4. `components/owner/VehicleCard.tsx`
   - Clean card with strong visual hierarchy
   - Plate number = largest text
   - Route = secondary
   - GHS total = prominent, green
   - Anomaly badge = red pill, right-aligned

5. `components/owner/EarningsBar.tsx`
   - Each bar must be visually clear
   - Today's bar = bright green
   - Anomaly bars = red
   - Day labels below bars

6. `components/owner/TripList.tsx`
   - Each row clearly separated
   - Amount right-aligned, bold
   - Time left-aligned, muted
   - Confidence badge: high=green dot, medium=amber dot, low=red dot

7. `app/owner/[vehicleId]/dispute/page.tsx` — Dispute page
   - Verdict badges must be very clear:
     "Match ✓" = bright green
     "Gap — explained" = amber
     "Gap — unexplained" = red
   - English and Twi sections clearly separated
   - "Get AI Verdict" button = full width, bold

8. Global loading state — `components/ui/LoadingSpinner.tsx`
   - Show on every API call
   - With message: "AI is thinking..." or "Checking records..."

Rules:
- Mobile first. Test at 375px width.
- Tailwind only. No new dependencies.
- Touch targets minimum 48px.
- Do not change any API call logic.
- Do not change lib/contracts.ts.

Files you may touch:
- app/page.tsx
- app/driver/page.tsx (visual only — no logic changes)
- app/owner/page.tsx (visual only)
- app/owner/[vehicleId]/page.tsx (visual only)
- app/owner/[vehicleId]/dispute/page.tsx (visual only)
- components/owner/VehicleCard.tsx
- components/owner/EarningsBar.tsx
- components/owner/TripList.tsx
- components/ui/LoadingSpinner.tsx
- app/globals.css (if needed)

Files you must not touch:
- lib/contracts.ts
- lib/db.ts
- lib/prompts.ts
- app/api/ (all API routes)

Definition of done:
- All screens look professional on 375px mobile viewport
- All tap targets are large enough
- Loading states exist on all async operations
- Anomaly and verdict badges are visually clear
- No new TypeScript errors introduced

Return:
1. List of visual changes made per file
2. Any logic you noticed is broken (but do NOT fix — tell ppk)
3. Anything you couldn't improve due to missing data
```

---

## C PROMPT 2 — QA the demo path
**Phase 5 · Hour 4:30**
**Start when:** ppk says integration is complete and deployed

```
Read this file:
- docs/00-START-HERE.md — specifically the "Demo moment" section

QA the live deploy by walking through the exact demo script in PERSON-C.md.

Test each step and report:

Step 1 — Landing page
[ ] Does "/" load correctly on mobile?
[ ] Are both "Driver" and "Owner" buttons visible and tappable?

Step 2 — Log a trip
[ ] Does the mic button appear?
[ ] Does it attempt to record?
[ ] Does the text fallback work?
[ ] Does logging with "Circle to Madina, twenty cedis" create a trip?
[ ] Does the confirmation show?

Step 3 — Owner dashboard
[ ] Does /owner load with all vehicles?
[ ] Does the logged trip appear?
[ ] Does the anomaly vehicle show the red badge?

Step 4 — Vehicle detail
[ ] Does the bar chart show 7 days?
[ ] Does "Get AI Summary" work and return Twi text?

Step 5 — Dispute resolver
[ ] Does typing "Driver says 80 cedis but I see 60" work?
[ ] Does the AI respond in both Twi and English?
[ ] Does the verdict badge display correctly?

For any FAIL: describe exactly what you see.
Do NOT fix issues yourself — report to ppk.

Also confirm:
[ ] The pitch deck is ready (5 slides)
[ ] You have memorized the demo script
[ ] You know who speaks and who drives the phone
```

---

## C OFFLINE TASK — Understand the demo data

Before you start any coding, open `lib/sampleData.ts` and understand:
- Which vehicle has the anomaly flag (low earnings day)
- What the routes are named (use these exact names in the pitch)
- What the GHS amounts look like realistic

This helps you make the pitch deck accurate.

---

*C: your job is polish and pitch quality. Do not touch logic or API routes. If you see bugs, report to ppk.*
