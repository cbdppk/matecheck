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
