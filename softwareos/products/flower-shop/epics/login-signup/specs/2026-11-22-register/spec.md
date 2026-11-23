# Register (sign up)

> Epic: ../../epic.md
> Status: in-progress
> Branch: feat/register
> Covers: /signup, POST /api/auth/register, apps/server/src/auth/**, apps/server/src/db/migrations/*users*, apps/server/src/db/migrations/*sessions*, apps/client/src/features/auth/signup/**

## Overview

First slice of the login-signup epic: a shopper creates an account (name, email, phone, password)
and is logged in straight away. The repo has no code yet, so this spec also sets up the minimal
project scaffold (npm workspaces: `apps/server` Express + TS, `apps/client` Vite + React + TS + Tailwind v4,
Postgres migrations), which later specs build on. It delivers these epic success criteria:
a new user can sign up and lands logged in; a duplicate email is rejected with a clear message;
passwords are stored only as hashes. This supports the mission goal that every buyer becomes a
registered user. Login, logout, keeping the session across visits (`/me`) and the checkout gate belong
to the `login-logout` and `checkout-auth-gate` specs.

## Goals & User Stories

- As a new shopper, I can sign up with my name, email, phone and password so I can check out later.
- As a new shopper, I'm logged in right after signing up, without a separate login step.
- As a shopper who already has an account, I'm told clearly that my email is already registered.

## Acceptance Criteria

1. AC1: `/signup` shows a form with Full name, Email, Phone and Password fields, each with a visible label, plus a "Create account" button, styled like the design canvas (DM Sans, #7A2E4D primary button, 46px rounded inputs).
2. AC2: Submitting valid details creates the user, returns `201` with `{ user: { id, name, email, phone } }`, and sets an httpOnly session cookie. The browser then goes to the home page (or a safe same-site `?next=` path), showing the shopper as logged in by first name.
3. AC3: Email is trimmed and lowercased before saving. Signing up with an email that already exists in any letter case returns `409` (`EMAIL_TAKEN`), and the form shows "An account with this email already exists" with a link to log in.
4. AC4: Invalid input returns `400` (`VALIDATION_ERROR`) with errors per field, shown next to each field: name is required (≤100 characters), email must be valid, phone must be 9–15 digits (an optional leading + is allowed, spaces and dashes are ignored), password must be 8–128 characters. The client checks the same rules before submitting.
5. AC5: The password is stored only as an argon2id hash. No response, log line or error contains the password or the hash.
6. AC6: The session cookie is `HttpOnly` and `SameSite=Lax` (plus `Secure` in production), and expires after 30 days. The `sessions` table stores only a SHA-256 hash of the session token.
7. AC7: A register request whose `Origin` doesn't match the allowed web origin is rejected with `403`.
8. AC8: Running `npm run dev` from the repo root starts the API and web app against local Postgres, and `npm test` runs both workspaces' tests.

## Technical Approach

- **Workspace:** root `package.json` with npm workspaces `apps/server` and `apps/client`, shared `tsconfig.base.json`, `docker-compose.yml` (Postgres 16), and a `.env.example` holding placeholder values only.
- **Local Postgres without Docker:** tests and `npm run dev` use PGlite (Postgres compiled to WASM), served over the Postgres wire protocol by `@electric-sql/pglite-socket`. The API, `pg` and node-pg-migrate talk to it exactly as they would to a real server. Tests use an in-memory instance; dev uses a persistent data dir (`apps/server/.pglite/`). Set `DATABASE_URL` to use a real Postgres (e.g. docker-compose) instead.
- **DB:** node-pg-migrate + `pg`. Migration `users` (uuid id, name, email `citext` unique, phone, password_hash, created_at, updated_at). Migration `sessions` (id = sha256(token) as the primary key, user_id FK on delete cascade, expires_at, created_at).
- **API:** Express app factory `apps/server/src/app.ts` (JSON body limit, error middleware with the shape `{ error: { code, message, fields? } }`). `apps/server/src/auth/`: `register.schema.ts` (zod), `password.ts` (argon2id hash and verify), `sessions.ts` (create a 32-byte random token, store its hash, set the cookie), `users.repo.ts`, `auth.routes.ts` (`POST /api/auth/register`), and an `originCheck` middleware for state-changing requests. Unique-violation `23505` → `409 EMAIL_TAKEN`.
- **Web:** React Router route `/signup` → `apps/client/src/features/auth/signup/SignupPage.tsx`, with the validation rules copied client-side. On success, store the returned user in a minimal `AuthProvider` state (`apps/client/src/features/auth/AuthContext.tsx`), which `login-logout` will later back with `/me`. Vite dev proxy for `/api`. Fonts from Google Fonts (DM Sans, DM Serif Display), with the Tailwind v4 theme set to the canvas colours.
- **Tests (TDD):** Vitest + supertest for the API against PGlite, and Vitest + Testing Library for the form.

## Out of Scope

- Login, logout, `/me`, keeping the session across a reload (spec `login-logout`).
- Checkout gate, redirect-back from checkout, cart merge (spec `checkout-auth-gate`).
- Password reset, email verification, social login, rate limiting on register.
- Default delivery address on the account.
- Hebrew/RTL (the build stays i18n-ready, with no hard-coded layout direction).

## Standards Applied

- [global/tech-stack](../../../../../../standards/global/tech-stack.md) — the scaffold uses React 18 + TS, Tailwind v4, Vite, Express + TS, PostgreSQL.
- [global/git-workflow](../../../../../../standards/global/git-workflow.md) — branch `feat/register`, `feat(login-signup): …` commits, PR via the pr skill.

## Changelog

| Date | Author | Type | Change | Ref |
|---|---|---|---|---|
| 2026-11-22 | barizbiski | created | Initial shaping | — |
| 2026-11-22 | barizbiski | change | Local DB via PGlite socket server (no Docker on dev machine); docker-compose kept as an option | T1 |
| 2026-11-22 | barizbiski | change | Branch renamed feat/login-signup/register → feat/register (user request; deviates from git-workflow naming) | — |
