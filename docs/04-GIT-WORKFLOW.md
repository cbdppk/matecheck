# MateCheck — Git Workflow
**3 people. 6 hours. One repo. Zero conflicts.**

---

## The golden rule

```
Nobody works on main.
Only ppk (Person A) merges to main.
One branch per task.
Merge early — not at the end.
```

---

## Setup (all three do this once)

```bash
# ppk does this first — creates the repo
git init mate-check
cd mate-check
git add .
git commit -m "init: scaffold from cursor"
git branch -M main

# Create GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/mate-check.git
git push -u origin main

# B and C do this after ppk pushes:
git clone https://github.com/YOUR_USERNAME/mate-check.git
cd mate-check
npm install
cp .env.local.example .env.local
# Fill in your API keys
```

---

## Branch map

| Branch | Owner | Task |
|---|---|---|
| `main` | ppk only | Always deployable |
| `feat/scaffold` | ppk | Init prompts 1–3 |
| `feat/driver` | ppk | Driver page |
| `feat/owner` | ppk | Owner dashboard |
| `feat/integration` | ppk | Wire APIs to UI |
| `feat/api` | B | All API routes |
| `feat/dispute` | B | Dispute resolver |
| `feat/polish` | C | Visual polish |

---

## ppk's merge order (critical — follow exactly)

```
Hour 0:45  →  merge feat/scaffold to main
Hour 0:45  →  merge feat/contract to main  (B's first output)
Hour 1:30  →  merge feat/driver to main
Hour 2:00  →  merge feat/owner to main
Hour 2:30  →  merge feat/api to main  (B's second output)
Hour 3:00  →  merge feat/dispute to main  (B's third output)
Hour 3:30  →  merge feat/integration to main
Hour 4:15  →  merge feat/polish to main  (C's output)
Hour 4:45  →  FREEZE — no more merges except hotfixes
```

---

## The daily loop for each person

```bash
# At the start of every task:
git checkout main
git pull origin main
git checkout -b feat/your-task

# While working:
git add .
git commit -m "feat: describe what you just did"
# Commit every 30 minutes minimum — don't lose work

# When done:
git push origin feat/your-task
# Tell ppk: "Branch feat/your-task is ready to merge"
```

---

## ppk's merge routine

```bash
# When B or C says they are ready:
git checkout main
git pull origin main
git merge feat/their-branch --no-ff -m "merge: feat/their-branch"

# If there are conflicts:
# Open the conflicted file in Cursor
# Keep YOUR version for any logic files
# Keep THEIR version for their owned files
# Never merge a conflict blindly

git push origin main

# Tell the team:
"Main updated. Pull before your next commit."
```

---

## After every ppk merge — team must do this

```bash
git checkout feat/your-branch
git fetch origin
git rebase origin/main
# or:
git merge origin/main

# Fix any conflicts in YOUR files only
git push origin feat/your-branch --force-with-lease
```

---

## Commit message format

```
init: project scaffold
feat: driver page shell with mic button
feat: voice-log API route with Claude parsing
feat: owner dashboard with vehicle cards
feat: dispute resolver API and page
fix: voice button not recording on iOS
polish: mobile spacing on vehicle cards
deploy: vercel production build
```

---

## Handling conflicts

### If `lib/contracts.ts` has a conflict
```
STOP. Do not resolve blindly.
Tell ppk immediately.
ppk decides which version is correct.
```

### If `app/api/` has a conflict
```
B owns this. Keep B's version.
ppk reviews before merging.
```

### If `components/` has a conflict
```
C owns this. Keep C's version.
Unless ppk changed it for integration — ppk decides.
```

### If `app/owner/page.tsx` has a conflict
```
ppk owns the logic.
C owns the visual classes.
Merge carefully: keep ppk's fetch logic, keep C's className strings.
```

---

## Emergency: something is broken on main

```bash
# ppk only:
git checkout main
git pull origin main
git checkout -b hotfix/describe-the-fix

# Make the fix
git add .
git commit -m "fix: describe what was broken"
git push origin hotfix/describe-the-fix

# Merge immediately:
git checkout main
git merge hotfix/describe-the-fix --no-ff -m "hotfix: describe fix"
git push origin main

# Tell B and C to rebase their branches
```

---

## Demo freeze protocol (Hour 4:45)

```bash
# ppk creates a tag for the stable version:
git tag -a v1.0-hackathon -m "Demo freeze — Cursor Hackathon Ghana"
git push origin v1.0-hackathon

# If a critical bug is found after freeze:
# ppk creates hotfix/critical-bug branch
# Makes the minimum fix
# Merges to main
# Vercel auto-deploys
# No other changes allowed
```

---

## Quick reference

```bash
# See what branch you are on:
git branch

# See what has changed:
git status

# See commit history:
git log --oneline -10

# Pull latest from main without losing your work:
git stash
git checkout main
git pull origin main
git checkout feat/your-branch
git merge main
git stash pop

# Undo your last commit (keep changes):
git reset --soft HEAD~1

# Check if your branch is behind main:
git fetch origin
git log HEAD..origin/main --oneline
```

---

## What NOT to do

```
❌ Never commit directly to main
❌ Never merge your own branch — tell ppk
❌ Never change lib/contracts.ts without announcing
❌ Never commit node_modules
❌ Never commit .env.local
❌ Never force push to main
❌ Never start a new feature after Hour 4:45
```

---

## .gitignore (make sure this exists)

```
node_modules/
.env.local
.env
.next/
dist/
.DS_Store
*.log
```
