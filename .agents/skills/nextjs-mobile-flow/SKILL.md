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
