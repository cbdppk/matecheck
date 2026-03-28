# MateCheck — Coordinator Playbook
**This is ppk's operating document. Keep it open all 6 hours.**

---

## Your checkpoints

### Hour 0:00 — START
- [ ] Everyone has the GitHub repo cloned
- [ ] Everyone has their `.env.local` filled
- [ ] You have run Init Prompt 1 → scaffold works on `localhost:3000`
- [ ] B has been told: "Start on feat/contract"
- [ ] C has been told: "Work on pitch deck offline until I say go"

**Announce:** "Starting now. B on contract. C on pitch deck. I'm on scaffold."

---

### Hour 0:45 — FIRST MERGE
- [ ] Init Prompts 1, 2, 3 are done → push `feat/scaffold`
- [ ] B is done with contracts → push `feat/contract`
- [ ] Merge both to main
- [ ] Tell B: "Main updated. Pull and start feat/api"
- [ ] You start: `feat/driver`

**Announce:** "Scaffold and contract merged. B start API. I'm on driver page."

---

### Hour 1:30 — PARALLEL CHECK-IN
- [ ] Your `feat/driver` — is the driver page rendering?
- [ ] B's `feat/api` — is the route skeleton responding?
- [ ] Merge `feat/driver` to main if ready
- [ ] Tell B: pull from main
- [ ] You start: `feat/owner`

**Announce:** "Driver merged. C — pull main and start polish branch."

---

### Hour 2:00 — OWNER READY
- [ ] `feat/owner` renders with sample data
- [ ] Merge `feat/owner` to main
- [ ] Tell B: "API should be ready soon — I need feat/api merged by 2:30"
- [ ] Tell C: "Main ready — start feat/polish now"

**Announce:** "Owner merged. B — I need the API by 2:30. C — start polishing."

---

### Hour 2:30 — API MERGE
- [ ] B's `feat/api` is ready
- [ ] Review: does every route return the correct contract type?
- [ ] Merge `feat/api` to main
- [ ] You start: `feat/integration` — wire UI to real API

**INTEGRATION IS THE RISKY STEP — give it full attention.**

Check after wiring:
- [ ] POST /api/voice-log receives text → inserts trip → returns confirmation
- [ ] GET /api/vehicles returns all vehicles with summaries
- [ ] GET /api/trips returns trips for a vehicle
- [ ] POST /api/summary returns AI note in Twi

---

### Hour 3:00 — DISPUTE MERGE
- [ ] B's `feat/dispute` is ready
- [ ] Test it manually: POST with a conflict scenario
- [ ] Does it return Twi + English analysis?
- [ ] Merge `feat/dispute` to main

---

### Hour 3:30 — HAPPY PATH TEST
Run the full demo script manually right now:
- [ ] Log a trip via text (voice fallback is fine)
- [ ] See it on owner dashboard
- [ ] Get AI summary
- [ ] Type a dispute → get Twi + English verdict

**If the happy path works → merge `feat/integration`**
**If it doesn't → do not merge. Fix first.**

---

### Hour 4:00 — C POLISH CHECK-IN
- [ ] C's `feat/polish` — are screens looking good on mobile?
- [ ] Any broken logic introduced? (C should not have changed logic)
- [ ] Merge `feat/polish` to main

---

### Hour 4:15 — DEPLOY
- [ ] Run: `vercel --prod`
- [ ] Set all 3 env vars in Vercel dashboard
- [ ] Hit the deployed URL on your phone
- [ ] Does it load?
- [ ] Run your Prompt A4 (smoke test)

---

### Hour 4:45 — DEMO FREEZE
**Say this out loud to the team:**

"Demo freeze. No new features. No refactors. If you see a bug, tell me and I decide if it gets fixed. Everyone rehearse the demo now."

- [ ] Create git tag: `git tag v1.0-hackathon && git push origin v1.0-hackathon`
- [ ] Save the live URL somewhere everyone can access
- [ ] Take one screenshot of the owner dashboard with real data
- [ ] Take one screenshot of the dispute result in Twi

---

### Hour 5:00 — REHEARSAL
- [ ] C runs the demo script 2× on the live deployed URL
- [ ] You watch for anything that breaks
- [ ] Fix maximum 1–2 critical things

---

### Hour 5:30 — FINAL STATE
- [ ] Is the live URL working?
- [ ] Does the dispute resolver return Twi text?
- [ ] Does the anomaly badge show?
- [ ] Does C have the pitch deck ready?
- [ ] Does C know the demo script by heart?
- [ ] Do you have a backup: phone screenshot of the working app?

**You are ready.**

---

## How to handle common disasters

### "The API is slow and the demo is hanging"
→ Pre-seed the DB with a trip already logged before going on stage
→ Use the owner dashboard which already has data
→ Skip the voice log step if needed

### "GhanaNLP is down"
→ The Twi text from Claude is still there (Claude can write Twi)
→ Say: "The voice in Twi — that's powered by a Ghana-built AI system"
→ Show the English version if needed

### "Claude API is slow"
→ Have a pre-generated dispute response saved in localStorage as a fallback
→ Show the dispute page with the pre-generated result

### "Vercel deploy failed"
→ Run `npm run dev` and demo locally via USB tethering or local IP
→ Have your laptop on the same WiFi as the projector

### "Someone asks about monetization"
→ GHS 5 per vehicle per month
→ Free for first 30 days
→ SMS alerts via MoMo for owners without smartphones (phase 2)

---

## The coordinator's rule

> You are not just a coder. You control sequence, scope, and merge timing.
> The app is as good as your coordination.
> Keep everyone in their lane. Keep contracts unchanged. Merge early.
