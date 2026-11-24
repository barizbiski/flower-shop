# Tasks — Register (sign up)

> Epic: login-signup
> Spec: 2026-11-22-register
> Branch: feat/register

## Scaffold

- [~] T1 Root npm workspaces, tsconfig.base.json, .gitignore, .env.example (placeholders), docker-compose.yml (Postgres 16)
- [x] T2 apps/backend: Express + TS app factory (src/app.ts, src/server.ts), error middleware, Vitest + supertest config, test DB setup
- [x] T3 apps/frontend: Vite + React 18 + TS + Tailwind v4, React Router, /api dev proxy, canvas fonts and colour theme, Vitest + Testing Library config
- [x] T4 node-pg-migrate setup and npm scripts (migrate up/down, root dev/test)

## Database

- [x] T5 Migration: users table (citext unique email) — apps/backend/src/db/migrations/
- [x] T6 Migration: sessions table (token hash PK, user FK cascade, expires_at)

## API — POST /api/auth/register

- [x] T7 Write failing API tests for AC2–AC7 (testing skill, TDD)
- [x] T8 register.schema.ts: zod validation and normalisation (trim/lowercase email, phone digits)
- [x] T9 password.ts: argon2id hash/verify
- [x] T10 sessions.ts: create token, store sha256, set cookie (HttpOnly, SameSite=Lax, Secure in prod, 30 days)
- [x] T11 users.repo.ts + auth.routes.ts: insert user and create session in one transaction, 23505 → 409 EMAIL_TAKEN
- [x] T12 originCheck middleware for state-changing /api requests

## Web — /signup

- [x] T13 Write failing form tests: labels, client validation, 409 and 400 messages, success redirect (testing skill, TDD)
- [x] T14 AuthContext.tsx: minimal provider seeded from the register response
- [x] T15 SignupPage.tsx: form in canvas style, field errors, "Log in" link on 409, safe ?next= redirect
- [x] T16 Minimal header showing the logged-in first name on the home page

## Verification

- [x] T17 Run the test suites and confirm everything passes (testing skill)
- [x] T18 Run QA against acceptance criteria (qa skill)
