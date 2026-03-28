# MateCheck — Hackathon Master Guide
**Cursor Hackathon Ghana · 6-Hour Build · 3-Person Team**

---

## What we are building

> We are building a **mobile-first trotro revenue tracker** for **commercial vehicle owners in Ghana** that helps them **know exactly what their drivers earned each day** by turning **untracked, trust-based cash collections** into **AI-verified trip logs with dispute resolution — in Twi and English**.

---

## The demo moment (90 seconds)

1. Driver opens phone, taps mic, says in Twi: *"Circle to Madina, twenty cedis"* → trip logs instantly
2. Owner sees GHS 20 appear on dashboard in real time → anomaly badge shows on another vehicle
3. Owner types: *"My driver says he made GHS 80 but I only see GHS 60"* → AI responds in Twi with neutral breakdown
4. Presenter says: **"This solves a problem every Ghanaian in this room knows. No one else is building it."**

---

## Team roles — READ THIS FIRST

| Person | Role | What you own | What you never touch |
|---|---|---|---|
| **You (ppk)** | Product + Integration Lead | App shell, routing, Neon DB, API integration, deployment, merges | Nothing is off-limits but you are the final merger |
| **Teammate B** | AI + Data Lead | `lib/contracts.ts`, `/api/voice-log`, `/api/summary`, `/api/dispute`, AI prompts, GhanaNLP calls | `app/page.tsx`, `app/owner/page.tsx` UI layout |
| **Teammate C** | UI Polish + Demo Lead | All visual components, cards, charts, loading states, mobile polish, pitch deck, demo script | API routes, contracts, DB schema |

---

## The 5 screens

| Route | Owner | Purpose |
|---|---|---|
| `/` | You | Landing — choose Driver or Owner |
| `/driver` | You (shell) + C (polish) | Log trip via voice or text |
| `/owner` | You (shell) + C (polish) | Dashboard — all vehicles, today's totals |
| `/owner/[vehicleId]` | You (shell) + C (polish) | Single vehicle — trip list, 7-day chart, AI summary |
| `/owner/[vehicleId]/dispute` | B (logic) + C (polish) | Dispute resolver — AI mediates in Twi |

---

## The shared contract — `lib/contracts.ts`

**This file is the law. Nobody changes it without announcing.**

```ts
// Vehicles
export type Vehicle = {
  id: string;
  plate: string;
  ownerName: string;
  route: string; // default route e.g. "Circle–Madina"
};

// A single trip logged by a driver
export type Trip = {
  id: string;
  vehicleId: string;
  amount: number;        // GHS
  route: string;
  loggedAt: string;      // ISO string
  rawVoiceText?: string; // original Twi transcript
  confidence: "high" | "medium" | "low";
};

// Daily rollup for a vehicle
export type DailySummary = {
  vehicleId: string;
  date: string;          // YYYY-MM-DD
  total: number;
  tripCount: number;
  avgPerTrip: number;
  aiNote?: string;       // Claude-generated in Twi
  anomaly: boolean;      // true if >30% below 7-day avg
};

// Response from /api/voice-log
export type VoiceLogResponse = {
  success: boolean;
  trip?: Trip;
  confirmationTwi?: string; // spoken back to driver
  error?: string;
};

// Response from /api/summary
export type SummaryResponse = {
  summary: DailySummary;
  aiNoteTwi: string;
  aiNoteEn: string;
};

// Response from /api/dispute
export type DisputeResponse = {
  analysisEn: string;
  analysisTwi: string;
  loggedTotal: number;
  claimedTotal: number;
  verdict: "matches" | "gap_explained" | "gap_unexplained";
};
```

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | Your default, fastest |
| DB | Neon (PostgreSQL) | Serverless, free tier, instant setup |
| ORM | `@neondatabase/serverless` + raw SQL | No ORM overhead for hackathon |
| AI | Claude API (claude-sonnet-4-6) | Parse voice, summarize, mediate |
| Voice STT | GhanaNLP ASR API | Twi speech → text |
| Voice TTS | GhanaNLP TTS API | Text → Twi audio confirmation |
| Styling | Tailwind CSS | Fast |
| Deploy | Vercel | One command |

---

## 6-hour phase map

```
Hour 0:00–0:45  Phase 0  — Scaffold + DB + roles confirmed       [You]
Hour 0:45–1:30  Phase 1  — Contracts + seeds + API skeletons     [B starts]
Hour 0:45–1:30  Phase 2A — Driver page shell                     [You in parallel]
Hour 1:30–2:30  Phase 2B — Voice → API → Neon flow               [B]
Hour 1:30–2:30  Phase 2C — Owner dashboard shell                 [You]
Hour 2:30–3:15  Phase 3  — Dispute resolver (AI killer feature)  [B]
Hour 2:30–3:30  Phase 3  — Full integration + Neon live          [You]
Hour 3:30–4:15  Phase 4A — Polish + mobile + seed data           [C leads]
Hour 4:15–4:45  Phase 4B — Vercel deploy + smoke test            [You]
Hour 4:45–5:15  Phase 5  — Demo freeze + rehearsal               [All]
Hour 5:15–6:00  BUFFER   — Bug fixes only. Zero new features.    [All]
```

---

## Phase gates — ask before every merge

### Gate 1 — Scope
- Does this still match the MVP?
- Did we accidentally add product surface?

### Gate 2 — Contract
- Does this still match `lib/contracts.ts`?
- Did anyone change the response shape silently?

### Gate 3 — UX
- Does the main path work on mobile?
- Is the voice button obvious?

### Gate 4 — Reliability
- Does sample data always work?
- Do loading + error states exist?

### Gate 5 — Merge
- Is manual happy-path done?
- Is this the right branch?

---

## Demo freeze rules (Hour 4:45 onward)

- Zero new features
- Zero refactors
- Zero schema changes
- Bug fixes only
- Only one person deploys: **You**
- All teammates: support demo rehearsal

---

## Git branches

```
main          ← only coordinator merges here
feat/scaffold ← Phase 0
feat/contract ← Phase 1 (B)
feat/driver   ← Phase 2A (You)
feat/api      ← Phase 2B (B)
feat/owner    ← Phase 2C (You)
feat/dispute  ← Phase 3 (B)
feat/polish   ← Phase 4A (C)
```

---

## Emergency fallbacks

If GhanaNLP ASR goes down → show text input, still works
If Claude API is slow → show skeleton loading state
If Neon connection fails → have mock data in `lib/sampleData.ts`
If voice doesn't work on judge's device → have pre-seeded demo data visible immediately

---

*This document is the single source of truth. Print it or keep it open in a second window throughout the build.*
