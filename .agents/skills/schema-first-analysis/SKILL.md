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
