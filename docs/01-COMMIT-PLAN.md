# MateCheck Commit Plan

This file translates the hackathon plan into mergeable phases.

## Branches

- `feat/scaffold` — base app, docs, folders, env example
- `feat/contract` — `lib/contracts.ts`, `lib/sampleData.ts`, `lib/prompts.ts`
- `feat/driver` — `/driver` page + `VoiceLogButton`
- `feat/api` — `/api/voice-log`, `/api/summary`
- `feat/owner` — `/owner` overview + `/owner/[vehicleId]`
- `feat/dispute` — `/api/dispute` + `/owner/[vehicleId]/dispute`
- `feat/integration` — switch sample-driven UI into live API flow
- `feat/polish` — mobile polish, loading states, pitch deck assets, demo screenshots

## Merge order

1. `feat/scaffold`
2. `feat/contract`
3. `feat/driver`
4. `feat/owner`
5. `feat/api`
6. `feat/dispute`
7. `feat/integration`
8. `feat/polish`

## Merge rule

Only the coordinator merges into `main`.

## Freeze point

At Hour 4:45:
- no new features
- no schema changes
- only hotfixes
- deploy and rehearse
