# MateCheck Starter

MateCheck is a **mobile-first trotro revenue tracker** for Ghanaian commercial vehicle owners.

This starter zip gives your team a clean repo to begin the hackathon build with:
- Next.js App Router + TypeScript + Tailwind scaffold
- shared contracts
- sample Ghana-focused seed data
- starter UI for driver and owner flows
- placeholder API routes for voice log, summary, dispute, vehicles, trips, and DB init
- team docs, prompts, skills, and coordination files

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`

## Environment variables

Create `.env.local` from `.env.local.example`:

```bash
DATABASE_URL=
ANTHROPIC_API_KEY=
GHANA_NLP_API_KEY=
```

Notes:
- Without `DATABASE_URL`, the app falls back to local sample data for dashboard reads.
- The starter routes are intentionally safe stubs. They are structured so Person B can replace the placeholder logic with live Claude + GhanaNLP integrations.

## Team files to read first

- `docs/00-START-HERE.md`
- `docs/01-COMMIT-PLAN.md`
- `docs/02-PERSON-B.md`
- `docs/03-PERSON-C.md`
- `docs/04-GIT-WORKFLOW.md`
- `docs/05-COORDINATOR-PLAYBOOK.md`

## Current starter status

Ready now:
- app shell
- sample data
- driver form
- owner dashboard
- vehicle detail
- dispute screen
- API route placeholders
- Neon helper functions

Still for the team to finish:
- real Claude parsing
- real GhanaNLP ASR / TTS / translate
- full Neon persistence flow
- deployment polish
- demo rehearsal assets
