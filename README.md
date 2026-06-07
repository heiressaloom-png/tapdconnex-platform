# TAPDconnex — Backend (Vercel + OpenAI + Supabase)

These files sit at the **repo root** (same level as `index.html`). Vercel auto-serves
anything in `/api` as a serverless function. The frontend already calls these routes
and falls back to local/mock behaviour until the env vars are set — so you can deploy
incrementally.

## Files
```
api/_prompt.js          # system prompt + buildCapturePrompt (shared, not a route)
api/transcribe.js       # POST audio  -> { transcript }   (OpenAI/Groq switch)
api/process-capture.js  # POST transcript+template+ownerStyle -> structured JSON
api/_supabase.js        # Supabase client factory (not a route)
api/captures.js         # GET/POST/PATCH capture persistence
supabase/schema.sql     # tables + RLS policies
package.json            # deps (openai, @supabase/supabase-js, formidable)
vercel.json             # function timeouts
.env.example            # required env var names
```

## Setup (in order)

### 1. OpenAI (unblocks the AI flow — do this first)
- Add `OPENAI_API_KEY` in Vercel → Settings → Environment Variables.
- Redeploy. `capture.html` will now use real transcription + structuring.
  Until the key exists, both endpoints return `{status:'placeholder'}` and the
  frontend uses its local draft generator — nothing breaks.
- Optional: set `TRANSCRIPTION_PROVIDER=groq` + `GROQ_API_KEY` to swap transcription
  to Groq later, with no code change.

### 2. Supabase (move the Hub off localStorage)
- Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
- Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Point the Hub/Capture at `/api/captures` (GET to load, POST to save, PATCH for
  outcome / name). The shape matches the capture object exactly.
- **Security:** `/api/captures` currently uses the service-role key keyed by a
  `userId` the client sends — fine for testing, NOT for production. Before go-live,
  wire **Supabase Auth**, send the user's JWT, switch to `userClient(jwt)`, and the
  RLS policies in `schema.sql` will enforce per-user isolation.

### 3. Payments / plan gating (LATER — not built yet)
Needs decisions from you first: Stripe account, a Pro price, and whether gating is
checkout-based or entitlement-based. Once you confirm, the flow is:
Stripe Checkout → webhook (`/api/stripe-webhook`) → set `profiles.plan = 'pro'` →
frontend reads plan from the profile instead of localStorage.

## Install deps locally (optional)
```
npm install
```
Vercel installs these automatically on deploy.
