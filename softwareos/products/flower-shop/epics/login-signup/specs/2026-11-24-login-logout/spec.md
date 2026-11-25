# Login & logout

> Epic: ../../epic.md
> Status: shaped
> Branch: feat/login
> Covers: /login, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout, GET /api/auth/me, apps/frontend/src/features/auth/login/**, apps/frontend/src/features/auth/AuthProvider.tsx, apps/frontend/src/components/layout/Header.tsx

## Overview

Second slice of the login-signup epic. A returning shopper logs in with email and password, stays
logged in across reloads and browser restarts until they log out, and can log out from the header.
The UI follows the design canvas (artboard "My account"): an account button in the header opens a
panel with the login form when logged out, or the shopper's name, email and a Log out button when
logged in. A `/login` page shows the same form, so `checkout-auth-gate` can later send shoppers to
`/login?next=/checkout`. Delivers these epic success criteria: wrong credentials show a generic
error that doesn't reveal whether the email exists; the session survives a page reload and a
browser restart until logout. Builds on the `register` spec's users and sessions tables and origin
check, and moves auth to access + refresh tokens: a 15-minute JWT access token delivered only as an
httpOnly cookie, and a non-rotating refresh session with a fixed 30-day expiry from login that never
leaves the server (a `sessions` row; the access token's `sub` points at it). Logout revokes the
session, so the access token can no longer be refreshed.

## Goals & User Stories

- As a returning shopper, I can log in with my email and password from the header or from `/login`.
- As a logged-in shopper, I stay logged in when I reload the page or come back later.
- As a logged-in shopper, I can see who I'm logged in as and log out from the header.
- As a new shopper who opened the login form, I can get to sign-up in one click.

## Acceptance Criteria

1. AC1: The header shows an account button: a person icon when logged out, the shopper's initials in a #7A2E4D circle when logged in. It has an accessible name ("Log in or open account menu" / "Account menu for <name>") and `aria-expanded`, and opens a panel styled like the design canvas (330px wide, 22px radius). Escape or a click outside closes it.
2. AC2: Logged out, the panel shows "Welcome back", Email and Password fields with visible labels, a "Log in" button and "New here? Create an account" linking to `/signup`. `/login` shows the same form as a page. Enter in the password field submits.
3. AC3: `POST /api/auth/login` with a correct email (any letter case, surrounding spaces ignored) and password returns `200` with `{ user: { id, name, email, phone } }` (no token in the body) and sets the access token in the same `access_token` cookie as register (HttpOnly, SameSite=Lax, Secure in production, `Path=/api`, Max-Age 30 days so an expired JWT can still reach `/refresh`). The access token is a JWT (HS256) that expires after 15 minutes, with `sub` = a random session token and `uid` = the user id; the `sessions` row stores only the session token's SHA-256 as its `id`, with a fixed 30-day `expires_at`. If the request already carries an access cookie signed by us, that old session is revoked (not deleted). The panel switches to the logged-in view; on `/login` the browser goes to a safe same-site `?next=` path or home.
4. AC4: A wrong password or an unknown email both return `401` (`INVALID_CREDENTIALS`) with the same message, "Incorrect email or password", which the form shows. Empty or malformed input returns `400` (`VALIDATION_ERROR`), and the client checks the same before submitting.
5. AC5: After 5 failed logins for the same email from the same IP within 15 minutes, further attempts return `429` (`RATE_LIMITED`) until the window passes, and the form says "Too many attempts. Please try again later." A successful login resets the count.
6. AC6: `GET /api/auth/me` returns `200 { user }` with a valid, unexpired access token in the `access_token` cookie and `401` (`UNAUTHENTICATED`) when it's missing, malformed, badly signed, expired or has no `uid`; protected routes check only the JWT (no DB lookup), and an `Authorization: Bearer` header is ignored. `POST /api/auth/refresh` reads the access cookie, checks its signature (an expired JWT is accepted here), and looks up the session by SHA-256 of its `sub` with `revoked_at IS NULL AND expires_at > now()`; if found it returns `200 { user }` and sets a new access cookie with the same `sub`, otherwise `401` (`UNAUTHENTICATED`) and clears the cookie. A refresh token in the body is ignored. Refresh does not rotate: the session row (including `expires_at`, fixed at 30 days from login — no sliding expiry) is not updated, so the same session keeps working, including concurrent refreshes from several tabs. A weekly background job deletes `sessions` rows whose `expires_at` has passed, revoked or not; `/refresh` checks `revoked_at` and `expires_at` itself and never relies on the job. On load the app calls `/refresh`, so a logged-in shopper still sees their initials after a reload or browser restart, with no logged-out flash while it loads. When an API call returns `401` the client refreshes once and retries. The client never holds the token.
7. AC7: `POST /api/auth/logout` marks the session behind the access cookie's `sub` revoked (`revoked_at = now()`, the row is kept until it expires), clears the `access_token` cookie and the legacy `refresh_token` cookie, and returns `204` — also with an expired access token, and with no, a malformed or an already revoked one (a second logout keeps the first `revoked_at`). The header shows the logged-out state. After logout the access token no longer works on `/refresh`; a copy of it taken before logout stays valid on protected routes until it expires (at most 15 minutes) — accepted by the product owner instead of a DB lookup on every request.
8. AC8: Login, refresh and logout requests whose `Origin` isn't the web app's origin are rejected with `403`. No log contains the password, its hash, the access token or the session token, and no response body contains any token (the access token is only in the httpOnly cookie; the refresh session never leaves the server).

## Technical Approach

- **API** (`apps/backend/src/features/auth/`, NestJS). A new `login/` folder mirrors `register/`; shared pieces get small additions in `shared/`:
  - `shared/users.repo.ts`: `UsersRepository.findByEmail(email)` returns the user with `password_hash`.
  - `shared/sessions.repo.ts`: each `sessions` row is one server-only refresh session (`id` = SHA-256 of the session token). Migration `sessions-revoked-at` adds a nullable `revoked_at`. `findUserByToken(token)` (read-only: join users, `revoked_at IS NULL AND expires_at > now()`), `revokeByToken(token)` (`UPDATE … SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`) and `deleteExpired()` (`DELETE ... WHERE expires_at <= now()`, returns the count). No `rotate`, no delete on logout.
  - `shared/session-cleanup.service.ts`: `SessionCleanupService` with a weekly `@Cron` (`@nestjs/schedule`, `ScheduleModule.forRoot()` in `AppModule`) calling `deleteExpired()`; failures are logged and retried on the next run. Migration adds an index on `sessions.expires_at`.
  - `shared/auth.constants.ts`: `ACCESS_COOKIE = 'access_token'`, `ACCESS_COOKIE_PATH = '/api'` (`API_BASE_PATH` from `@flower-shop/shared`), `ACCESS_COOKIE_MAX_AGE_MS = REFRESH_TTL_MS` (30 days), `ACCESS_TOKEN_TTL_S = 15 * 60`, and `LEGACY_REFRESH_COOKIE` / `LEGACY_REFRESH_COOKIE_PATH` (only cleared, never read).
  - `shared/access-cookie.ts` (replaces `refresh-cookie.ts`): `setAccessCookie(res, token, secure)`, `clearAuthCookies(res, secure)` (the access cookie and the legacy `refresh_token` cookie) and `readAccessToken(req)` from the cookie only (cookie-parser).
  - `shared/access-token.service.ts`: `AccessTokenService` wrapping `@nestjs/jwt` — `sign({ sessionToken, userId })` (HS256, `sub` = session token, `uid` = user id, 15 min), `verify(token)` (claims of a valid, unexpired token, else null) and `verifyIgnoringExpiry(token)` (signature only — used by refresh and logout to find the session, never to authorise a request). `AppConfig` gets `jwtAccessSecret`, read from the required env var `JWT_ACCESS_SECRET`; the server refuses to start without it. `.env.example` gets a placeholder only.
  - `shared/jwt-auth.guard.ts`: `JwtAuthGuard` reads the `access_token` cookie, verifies it via `AccessTokenService.verify` (no DB lookup), puts `uid` on the request, else `401 UNAUTHENTICATED`. Reused later by `checkout-auth-gate`.
  - `shared/token-issuer.service.ts`: `TokenIssuer` used by register, login and refresh — `respond()` signs an access token for the session, sets the access cookie and returns `{ user }`; `sessionTokenFrom(req)` returns the `sub` of the request's access cookie (expired or not) when it's signed by us.
  - `register/register.controller.ts`: returns `201 { user }` and sets the `access_token` cookie (see the register spec's changelog).
  - `login/login.constants.ts`: `LOGIN_MESSAGES`, `LOGIN_MAX_FAILURES = 5`, `LOGIN_WINDOW_MS = 15 min`. Reuses `EMAIL_MAX_LENGTH` and `PASSWORD_MAX_LENGTH` from `shared/auth.constants.ts`.
  - `login/login.schema.ts` (zod) + `login/login.types.ts`: email trimmed and lowercased, password required (≤128 chars).
  - `login/login-rate-limiter.ts`: in-memory `LoginRateLimiter` provider (fixed 15-minute window keyed by `ip + email`, 5 failures, reset on success). Single-instance only, which is fine for the MVP; noted as a risk.
  - `login/login.service.ts`: `LoginService.login` finds the user and runs `verifyPassword`; if the user is missing it verifies against a fixed dummy argon2id hash so timing doesn't reveal whether the email exists. On success it creates a session via `SessionsRepository.create` (revoking the request's existing session first). Also `refresh(sessionToken)` (returns `{ user, sessionToken }` for a live session, else 401), `logout(sessionToken)` (revokes) and `me(userId)`.
  - `login/login.controller.ts`: `LoginController` with `POST /auth/login` (`@HttpCode(200)`), `POST /auth/refresh` (`@HttpCode(200)`), `POST /auth/logout` (`@HttpCode(204)`), and `GET /auth/me` behind `JwtAuthGuard`.
  - `auth.module.ts`: import `JwtModule`, register `LoginController`, `LoginService`, `LoginRateLimiter`, `AccessTokenService`, `JwtAuthGuard` next to the register ones.
  - New error codes in `common/constants/error-codes.ts`: `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `RATE_LIMITED`.
  - `OriginGuard` already covers POSTs, including `/refresh`; no change needed.
- **Web** (`apps/frontend/src/`):
  - `lib/apiClient/`: `getJson` / `postJson` send same-origin requests (the browser attaches the httpOnly cookie; no `Authorization` header, no token in memory), and on a `401` call `/api/auth/refresh` once (single in-flight refresh shared by concurrent calls) and retry; if the refresh returns `401`, notify the AuthProvider (logged out). Auth endpoints themselves are never retried.
  - `features/auth/shared/auth.api.ts`: `postCredentials` (login and register return `{ user }`), `refreshSession`, `logoutUser`, `fetchMe`; routes come from `AUTH_PATHS` in `@flower-shop/shared`.
  - `AuthProvider`: holds only the user, adds `status: 'loading' | 'ready'`, calls `refreshSession` on mount, and exposes `logout()`. The header renders nothing in the account slot while loading.
  - `features/auth/login/`: `LoginForm.tsx` (shared by panel and page), `useLoginForm.ts` (client validation, submit, error mapping; takes an `onSuccess`), `LoginPage.tsx` (route `/login`, safe `?next=` redirect via `utils/safeNext`).
  - `components/layout/AccountMenu.tsx`: the header button and panel (logged-out form, or avatar + "Hello," + name + email + Log out), styled from the canvas (DM Serif Display heading, 46px inputs with 14px radius, 48px primary button, #A3243F error text). `Header.tsx` swaps its "Create an account" link for `AccountMenu`.
  - Reuse `TextField`, `Button`, `Alert`, `TextLink` from `components/ui/`; `getFirstName` and initials from `utils/string.ts`.
- **Tests:** test mode is none. Existing tests (`register.test.ts`, `SignupPage.test.tsx`, `Header.test.tsx`, `App.test.tsx`) must keep passing; update `register.test.ts` for the `refresh_token` cookie and `accessToken` in the response, and `Header.test.tsx` and `App.test.tsx` where the header change breaks them (mock `/refresh`). The test setup sets a dummy `JWT_ACCESS_SECRET`.

## Out of Scope

- Password reset and "Forgot your password?" (epic out of scope; needs an email provider).
- The canvas's My account, My orders, Occasion reminders and admin Store dashboard links.
- Checkout gate, redirect back to checkout, cart kept through login (spec `checkout-auth-gate`).
- Distributed or persistent rate limiting (in-memory only for now); CAPTCHA; account lockout.
- "Log out of all devices".
- Refresh-token rotation and sliding expiry (explicitly not wanted for now).
- Non-browser (mobile) clients: the API is cookie-only for now and no longer accepts a refresh token in the body.
- Refresh-token reuse detection; immediate access-token revocation on protected routes (denylist, token version or a per-request session lookup). Refresh itself is revoked immediately via `revoked_at`.
- Asymmetric signing (RS256) and secret rotation tooling.
- Hebrew/RTL.

## Standards Applied

- [global/tech-stack](../../../../../../standards/global/tech-stack.md): React 18 + TS, Tailwind v4, Vite, NestJS (Express platform) + TS, PostgreSQL.
- [global/git-workflow](../../../../../../standards/global/git-workflow.md): `feat(login-signup): …` commits, PR via the pr skill. Branch is `feat/login` (user's choice; deviates from the `feat/<epic>/<spec>` naming, as register did). Per "Keep PRs small", ship it as two PRs: the API (T1–T7, T15–T18) first, then the web UI (T8–T13, T19).

## Changelog

| Date | Author | Type | Change | Ref |
|---|---|---|---|---|
| 2026-11-24 | barizbiski | created | Initial shaping | — |
| 2026-11-24 | barizbiski | change | API approach updated to the features/auth layout from v2 (new login/ folder, additions in shared/); split into API and web PRs per "Keep PRs small" | T1–T7 |
| 2026-11-24 | barizbiski | change | Auth moved from cookie-only server sessions to a 15-min JWT access token (Bearer) + 30-day rotating refresh token (hash in `sessions`, httpOnly cookie on web); new `POST /api/auth/refresh`, `JwtAuthGuard`; AC3, AC6, AC7, AC8 and Technical Approach updated; register now returns `accessToken` — to support a future mobile app and follow the common token pattern | T15–T19 |
| 2026-11-25 | barizbiski | change | Refresh no longer rotates: `/refresh` only issues a new access token (no new refresh token, no cookie, session row and its fixed 30-day `expires_at` untouched); `rotate` replaced by read-only `findUserByToken`; hourly `SessionCleanupService` (`@nestjs/schedule`) deletes expired sessions, plus `sessions.expires_at` index; AC6, Overview, Technical Approach and Out of Scope updated — avoids rewriting the refresh token every 15 minutes and the multi-tab race where one tab's rotation logged out the other | T3, T17, T20 |
| 2026-11-25 | barizbiski | change | Access token moved to an httpOnly `access_token` cookie (`Path=/api`, Max-Age 30 days); refresh token is server-only (the `sessions` row; JWT `sub` = session token, `uid` = user id); `/refresh` works from an expired access cookie; logout sets new `revoked_at` instead of deleting the row; Bearer header and body refresh token removed; cleanup runs weekly; AC3, AC6, AC7, AC8, Overview, Technical Approach and Out of Scope updated — the refresh token should never reach the client, and logout must block refresh while the row stays until it expires; access tokens stay usable on protected routes for up to 15 minutes after logout (no per-request DB lookup, product owner's choice) | T21–T24 |
