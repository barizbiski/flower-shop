# Login & logout

> Epic: ../../epic.md
> Status: shaped
> Branch: feat/login
> Covers: /login, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, apps/frontend/src/features/auth/login/**, apps/frontend/src/features/auth/AuthProvider.tsx, apps/frontend/src/components/layout/Header.tsx

## Overview

Second slice of the login-signup epic. A returning shopper logs in with email and password, stays
logged in across reloads and browser restarts until they log out, and can log out from the header.
The UI follows the design canvas (artboard "My account"): an account button in the header opens a
panel with the login form when logged out, or the shopper's name, email and a Log out button when
logged in. A `/login` page shows the same form, so `checkout-auth-gate` can later send shoppers to
`/login?next=/checkout`. Delivers these epic success criteria: wrong credentials show a generic
error that doesn't reveal whether the email exists; the session survives a page reload and a
browser restart until logout. Builds on the `register` spec's users and sessions tables, session
cookie and origin check.

## Goals & User Stories

- As a returning shopper, I can log in with my email and password from the header or from `/login`.
- As a logged-in shopper, I stay logged in when I reload the page or come back later.
- As a logged-in shopper, I can see who I'm logged in as and log out from the header.
- As a new shopper who opened the login form, I can get to sign-up in one click.

## Acceptance Criteria

1. AC1: The header shows an account button: a person icon when logged out, the shopper's initials in a #7A2E4D circle when logged in. It has an accessible name ("Log in or open account menu" / "Account menu for <name>") and `aria-expanded`, and opens a panel styled like the design canvas (330px wide, 22px radius). Escape or a click outside closes it.
2. AC2: Logged out, the panel shows "Welcome back", Email and Password fields with visible labels, a "Log in" button and "New here? Create an account" linking to `/signup`. `/login` shows the same form as a page. Enter in the password field submits.
3. AC3: `POST /api/auth/login` with a correct email (any letter case, surrounding spaces ignored) and password returns `200` with `{ user: { id, name, email, phone } }` and sets the same session cookie as register (HttpOnly, SameSite=Lax, Secure in production, 30 days, only the token's SHA-256 stored). The panel switches to the logged-in view; on `/login` the browser goes to a safe same-site `?next=` path or home.
4. AC4: A wrong password or an unknown email both return `401` (`INVALID_CREDENTIALS`) with the same message, "Incorrect email or password", which the form shows. Empty or malformed input returns `400` (`VALIDATION_ERROR`), and the client checks the same before submitting.
5. AC5: After 5 failed logins for the same email from the same IP within 15 minutes, further attempts return `429` (`RATE_LIMITED`) until the window passes, and the form says "Too many attempts. Please try again later." A successful login resets the count.
6. AC6: `GET /api/auth/me` returns `200 { user }` for a valid, unexpired session and `401` (`UNAUTHENTICATED`) otherwise. On load the app calls it, so a logged-in shopper still sees their initials after a reload or browser restart, with no logged-out flash while it loads.
7. AC7: `POST /api/auth/logout` deletes the session row, clears the cookie and returns `204`, even with no or an unknown session. The header then shows the logged-out state, and an old cookie value no longer works on `/me`.
8. AC8: Login and logout requests whose `Origin` isn't the web app's origin are rejected with `403`. No response or log contains the password, its hash or the session token.

## Technical Approach

- **API** (`apps/backend/src/features/auth/`, NestJS). A new `login/` folder mirrors `register/`; shared pieces get small additions in `shared/`:
  - `shared/users.repo.ts`: `UsersRepository.findByEmail(email)` returns the user with `password_hash`.
  - `shared/sessions.repo.ts`: `SessionsRepository.findUserByToken(token)` (join users, `expires_at > now()`) and `deleteByToken(token)`.
  - `shared/session-cookie.ts`: add `clearSessionCookie(res, secure)` with the same attributes as `setSessionCookie`, and `readSessionToken(req)` for the `sid` cookie (cookie-parser).
  - `login/login.constants.ts`: `LOGIN_MESSAGES`, `LOGIN_MAX_FAILURES = 5`, `LOGIN_WINDOW_MS = 15 min`. Reuses `EMAIL_MAX_LENGTH` and `PASSWORD_MAX_LENGTH` from `shared/auth.constants.ts`.
  - `login/login.schema.ts` (zod) + `login/login.types.ts`: email trimmed and lowercased, password required (≤128 chars).
  - `login/login-rate-limiter.ts`: in-memory `LoginRateLimiter` provider (fixed 15-minute window keyed by `ip + email`, 5 failures, reset on success). Single-instance only, which is fine for the MVP; noted as a risk.
  - `login/login.service.ts`: `LoginService.login` finds the user and runs `verifyPassword`; if the user is missing it verifies against a fixed dummy argon2id hash so timing doesn't reveal whether the email exists. On success it creates a session via `SessionsRepository.create`, deleting the request's existing session first. Also `logout(token)` and `me(token)`.
  - `login/login.controller.ts`: `LoginController` with `POST /auth/login` (`@HttpCode(200)`), `POST /auth/logout` (`@HttpCode(204)`), `GET /auth/me`.
  - `auth.module.ts`: register `LoginController`, `LoginService`, `LoginRateLimiter` next to the register ones.
  - New error codes in `common/constants/error-codes.ts`: `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `RATE_LIMITED`.
  - `OriginGuard` already covers POSTs; no change needed.
- **Web** (`apps/frontend/src/`):
  - `lib/apiClient.ts`: add `getJson` (same-origin, credentials).
  - `features/auth/api.ts`: `loginUser`, `logoutUser`, `fetchMe`. Add the routes to `constants/api.ts`.
  - `AuthProvider`: adds `status: 'loading' | 'ready'`, calls `fetchMe` on mount, and exposes `logout()`. The header renders nothing in the account slot while loading.
  - `features/auth/login/`: `LoginForm.tsx` (shared by panel and page), `useLoginForm.ts` (client validation, submit, error mapping; takes an `onSuccess`), `LoginPage.tsx` (route `/login`, safe `?next=` redirect via `utils/safeNext`).
  - `components/layout/AccountMenu.tsx`: the header button and panel (logged-out form, or avatar + "Hello," + name + email + Log out), styled from the canvas (DM Serif Display heading, 46px inputs with 14px radius, 48px primary button, #A3243F error text). `Header.tsx` swaps its "Create an account" link for `AccountMenu`.
  - Reuse `TextField`, `Button`, `Alert`, `TextLink` from `components/ui/`; `getFirstName` and initials from `utils/string.ts`.
- **Tests:** test mode is none. Existing tests (`register.test.ts`, `SignupPage.test.tsx`, `Header.test.tsx`, `App.test.tsx`) must keep passing; update `Header.test.tsx` and `App.test.tsx` where the header change breaks them (mock `/me`).

## Out of Scope

- Password reset and "Forgot your password?" (epic out of scope; needs an email provider).
- The canvas's My account, My orders, Occasion reminders and admin Store dashboard links.
- Checkout gate, redirect back to checkout, cart kept through login (spec `checkout-auth-gate`).
- Distributed or persistent rate limiting (in-memory only for now); CAPTCHA; account lockout.
- "Log out of all devices"; expired-session cleanup job.
- Hebrew/RTL.

## Standards Applied

- [global/tech-stack](../../../../../../standards/global/tech-stack.md): React 18 + TS, Tailwind v4, Vite, NestJS (Express platform) + TS, PostgreSQL.
- [global/git-workflow](../../../../../../standards/global/git-workflow.md): `feat(login-signup): …` commits, PR via the pr skill. Branch is `feat/login` (user's choice; deviates from the `feat/<epic>/<spec>` naming, as register did). Per "Keep PRs small", ship it as two PRs: the API (T1–T7) first, then the web UI (T8–T13).

## Changelog

| Date | Author | Type | Change | Ref |
|---|---|---|---|---|
| 2026-11-24 | barizbiski | created | Initial shaping | — |
| 2026-11-24 | barizbiski | change | API approach updated to the features/auth layout from v2 (new login/ folder, additions in shared/); split into API and web PRs per "Keep PRs small" | T1–T7 |
