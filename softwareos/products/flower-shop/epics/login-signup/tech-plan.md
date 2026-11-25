# User Accounts — Tech Plan

> Epic: epic.md · Product: ../../mission.md

## Approach

Access + refresh tokens. The API exposes auth routes (register, login, refresh, logout, me);
passwords are hashed with argon2id. On login or sign-up the server issues:

- an **access token**: a JWT (HS256, `sub` = user id, `iat`, `exp`) valid for 15 minutes, signed with
  `JWT_ACCESS_SECRET`. Clients send it as `Authorization: Bearer <token>`; the server verifies the
  signature and expiry without a DB lookup.
- a **refresh token**: a random 32-byte token valid for 30 days, stored only as a SHA-256 hash in the
  `sessions` table. `POST /api/auth/refresh` exchanges it for a new access token and rotates it
  (old row deleted, new one created). Logout deletes the row.

The web client keeps the access token in memory only and the refresh token in an httpOnly,
SameSite=Lax cookie scoped to `/api/auth`; on load it calls `/refresh` to restore the session. A
future mobile client sends both tokens in headers/body and stores them in the platform's secure
storage. A `JwtAuthGuard` protects authenticated endpoints (`/me`, later checkout). The React client
has an AuthContext, Login and Sign-up pages, and redirects back to checkout after authentication.

Chosen over cookie-only server sessions so the same API serves a future mobile app and follows the
common token pattern. Trade-off: an access token can't be revoked, so after logout it stays valid
for up to 15 minutes; the refresh token is revoked immediately.

## Architecture Impact

- **Database:** new `users` table (id, name, email unique and case-insensitive, phone,
  password_hash, timestamps); new `sessions` table holding refresh-token hashes (no schema change
  from the cookie-session design).
- **API server:** `/api/auth/*` routes including `/refresh`; JWT signing/verification (`@nestjs/jwt`)
  and a `JwtAuthGuard`; rate limiting on login.
- **Config:** new required secret `JWT_ACCESS_SECRET` (placeholder only in `.env.example`).
- **Web client:** AuthContext holding the access token in memory, an API client that sends the
  Bearer header and refreshes once on `401`, Login and Sign-up pages, route guard on checkout.
- No new services or infra.

## Risks & Unknowns

- The codebase is greenfield: the API, DB migrations and web app don't exist yet. This epic may need
  to scaffold them, or depend on whichever epic does.
- Cart merge: the guest cart must survive login. Where a guest cart lives is still open.
- Brute force and credential stuffing: need login rate limiting.
- CSRF on the refresh cookie (`/refresh`, `/logout`): SameSite plus origin checks. Bearer-authenticated
  requests aren't exposed to CSRF.
- Access tokens can't be revoked: up to 15 minutes of access after logout or a block. Acceptable for
  the shop; immediate revocation would need a per-request DB check.
- `JWT_ACCESS_SECRET` leak lets anyone mint tokens: keep it out of git, rotate it if exposed (rotation
  logs everyone out within 15 minutes).
- XSS can read the in-memory access token while the page is open, but not the httpOnly refresh cookie.
- Refresh-token reuse detection (revoking a whole session family when an old token is replayed) is
  not in the MVP; rotation only.
- Email case-normalisation and uniqueness.
- No password reset at launch: locked-out users need manual support.

## Candidate Specs

- `register` — users and sessions tables, `POST /api/auth/register`, sign-up page, logged in automatically after sign-up.
- `login-logout` — login, refresh, logout and me endpoints, access/refresh tokens and `JwtAuthGuard`, login page, AuthContext, session kept across visits, login rate limiting.
- `checkout-auth-gate` — `JwtAuthGuard` on the checkout API, redirect to log in or sign up and back to checkout, cart kept, account details available for "send to myself".
