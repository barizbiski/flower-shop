# User Accounts — Tech Plan

> Epic: epic.md · Product: ../../mission.md

## Approach

Access + refresh tokens. The API exposes auth routes (register, login, refresh, logout, me);
passwords are hashed with argon2id. On login or sign-up the server issues:

- a **refresh session**: a `sessions` row valid for a fixed 30 days (no rotation, no sliding expiry).
  Its `id` is the SHA-256 of a random 32-byte session token; the session never leaves the server.
- an **access token**: a JWT (HS256, `sub` = the raw session token, `uid` = user id, `iat`, `exp`)
  valid for 15 minutes, signed with `JWT_ACCESS_SECRET`, set as an httpOnly, SameSite=Lax cookie
  `access_token` on `Path=/api` with a 30-day Max-Age (so an expired JWT can still reach `/refresh`).
  Protected routes verify the signature and expiry without a DB lookup.

`POST /api/auth/refresh` takes the access cookie (expired is fine, signature must be valid), finds the
session by SHA-256 of `sub` where `revoked_at IS NULL` and `expires_at > now()`, and sets a new
access cookie. Logout sets `revoked_at` (the row is kept until a weekly job deletes expired rows), so
the access token can no longer be refreshed. On load the web client calls `/refresh` to restore the
session; it never holds a token itself. A `JwtAuthGuard` protects authenticated endpoints (`/me`,
later checkout). The React client has an AuthContext, Login and Sign-up pages, and redirects back to
checkout after authentication.

Chosen over cookie-only server sessions to keep stateless access checks and the common token
pattern. Trade-off: an access token can't be revoked, so a copy taken before logout stays valid on
protected routes for up to 15 minutes; refresh is blocked immediately.

## Architecture Impact

- **Database:** new `users` table (id, name, email unique and case-insensitive, phone,
  password_hash, timestamps); new `sessions` table holding refresh sessions (`id` = token hash,
  `user_id`, `expires_at`, `revoked_at`).
- **API server:** `/api/auth/*` routes including `/refresh`; JWT signing/verification (`@nestjs/jwt`)
  and a `JwtAuthGuard`; rate limiting on login.
- **Config:** new required secret `JWT_ACCESS_SECRET` (placeholder only in `.env.example`).
- **Web client:** AuthContext holding only the user, an API client that relies on the httpOnly
  cookie and refreshes once on `401`, Login and Sign-up pages, route guard on checkout.
- No new services or infra.

## Risks & Unknowns

- The codebase is greenfield: the API, DB migrations and web app don't exist yet. This epic may need
  to scaffold them, or depend on whichever epic does.
- Cart merge: the guest cart must survive login. Where a guest cart lives is still open.
- Brute force and credential stuffing: need login rate limiting.
- CSRF: the access cookie is sent to the whole API, so SameSite=Lax plus the origin check on every
  state-changing request are what protect it; GET routes must stay side-effect free.
- Access tokens can't be revoked: up to 15 minutes of access after logout or a block. Acceptable for
  the shop; immediate revocation would need a per-request DB check.
- The access cookie is also the key to refreshing for 30 days: whoever steals it can refresh until
  logout or expiry. Same exposure as the former refresh cookie; httpOnly keeps it from page scripts.
- `JWT_ACCESS_SECRET` leak lets anyone mint tokens: keep it out of git, rotate it if exposed (rotation
  logs everyone out within 15 minutes).
- XSS can't read the httpOnly access cookie, but can still make requests from the page while it's open.
- No rotation and no reuse detection in the MVP; a mobile client would need a non-cookie variant.
- Email case-normalisation and uniqueness.
- No password reset at launch: locked-out users need manual support.

## Candidate Specs

- `register` — users and sessions tables, `POST /api/auth/register`, sign-up page, logged in automatically after sign-up.
- `login-logout` — login, refresh, logout and me endpoints, access/refresh tokens and `JwtAuthGuard`, login page, AuthContext, session kept across visits, login rate limiting.
- `checkout-auth-gate` — `JwtAuthGuard` on the checkout API, redirect to log in or sign up and back to checkout, cart kept, account details available for "send to myself".
