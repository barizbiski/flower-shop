# QA Report — Register (sign up)

> Spec: spec.md
> Date: 2026-11-22 · QA by: barizbiski · Mode: setup
> Verdict: PASS WITH NOTES
> Stale: spec changed 2026-11-24 (Acceptance Criteria) — rerun the qa skill

## Acceptance Criteria

| AC | Criterion | Result | Evidence |
|---|---|---|---|
| AC1 | `/signup` form: labelled name/email/phone/password, "Create account", canvas style | pass | `SignupPage.test.tsx` "shows labelled name, email, phone and password fields…"; observed in the browser at `/signup` (DM Serif heading, 46px rounded inputs, #7A2E4D pill button) |
| AC2 | 201 + public user + session cookie; redirect home or safe `?next=`; shown logged in by first name | pass | `register.test.ts` "creates the user, returns 201…"; `SignupPage.test.tsx` "posts the details…", "honours a safe same-site ?next=", 4× "ignores an unsafe ?next="; `Header.test.tsx` "greets a logged-in shopper by first name"; browser run: sign-up redirected to `/` showing "Hi, Test" |
| AC3 | Email trimmed and lowercased; duplicate in any case → 409 EMAIL_TAKEN plus message and log-in link | pass | `register.test.ts` "trims and lowercases…", "rejects an already-registered email in any letter case…"; `SignupPage.test.tsx` "shows the duplicate-email message…"; browser run: an upper-case duplicate showed "An account with this email already exists · Log in instead" |
| AC4 | 400 VALIDATION_ERROR with errors per field; rules mirrored client-side | pass | `register.test.ts` 8× "rejects invalid %s…" and "reports every missing field at once"; `SignupPage.test.tsx` "shows field errors and does not submit…", "shows server field errors…" |
| AC5 | argon2id hash only; password/hash never in responses or logs | pass | `register.test.ts` "stores only an argon2id hash…" (asserts `$argon2id$`, checks the body and console calls); `apps/backend/src/auth/password.ts:5`; `apps/backend/src/http/errors.ts:31` logs only `err.message` |
| AC6 | HttpOnly, SameSite=Lax, Secure in prod, 30 days; only the SHA-256 of the token stored | pass | `register.test.ts` "sets an HttpOnly, SameSite=Lax, 30-day cookie and stores only the token hash", "marks the session cookie Secure"; browser: `document.cookie` does not expose `sid` |
| AC7 | Foreign or missing Origin on a state-changing request → 403 | pass | `register.test.ts` "rejects a request from a foreign Origin…", "rejects a state-changing request with no Origin header"; `apps/backend/src/http/originCheck.ts:11` |
| AC8 | `npm run dev` starts API plus web against local Postgres; `npm test` runs both workspaces | pass | Observed: `npm run dev` started Vite on :5173 and the API on :3001 with the PGlite dev DB (per the spec's Technical Approach); `npm test` ran api (17) and web (13) |

## Checks Run

- build: `npm run build` — pass (web Vite build; the API has no build step and runs via tsx)
- lint: none configured — n/a
- typecheck: `npm run typecheck` — fail (no tsconfig files in the repo yet, see Notes). The equivalent check against scratch copies of the same configs, `tsc --noEmit` over 32 app files, passes with 0 errors.
- tests: `npm test` — pass (30 passed, 0 failed: api 17, web 13)

## Issues Found

| # | Severity | Issue | Route |
|---|---|---|---|
| 1 | low | `tsconfig.base.json`, `apps/backend/tsconfig.json` and `apps/frontend/tsconfig.json` aren't in the repo yet: the SoftwareOS protect-config hook blocks agents from creating them, and the user is copying them in by hand. `npm run typecheck` fails until then. | T1 (kept `[~]`) |

## Notes

- **Typecheck:** the config contents were reviewed and passed when run from the scratchpad. Once the files are copied in, rerun `npm run typecheck` to confirm.
- **Lint:** no linter is configured yet. Worth a chore spec; the protect-config hook will also block creating an ESLint config.
- **Branch state:** no PR yet (`gh` isn't installed here). Open one with the pr skill.
- **Dependencies:** `npm audit --omit=dev` still reports `glob` and `minimatch` advisories, which come in through node-pg-migrate 7. The `glob` one concerns the glob CLI, which this project doesn't use. React Router and Zod were upgraded to patched majors during implementation.
- **Local DB:** Docker isn't available on the dev machine, so dev and tests use PGlite over the Postgres wire protocol. `docker-compose.yml` is kept for real Postgres (see the spec Changelog).
