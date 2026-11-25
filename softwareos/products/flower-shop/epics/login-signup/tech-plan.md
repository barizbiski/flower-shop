# User Accounts — Tech Plan

> Epic: epic.md · Product: ../../mission.md

## Approach

Cookie-based server sessions. The Express API exposes auth routes (register, login, logout, me);
passwords are hashed with bcrypt or argon2. On login or sign-up the server creates a session row in
PostgreSQL and sets its id in an httpOnly, SameSite cookie. A `requireAuth` middleware guards checkout
endpoints. The React client has an AuthContext (backed by `/me`), Login and Sign-up pages, and
redirects back to checkout after authentication. Chosen over JWT for simplicity and easy revocation.

## Architecture Impact

- **Database:** new `users` table (id, name, email unique and case-insensitive, phone,
  password_hash, timestamps); new `sessions` table.
- **API server:** `/api/auth/*` routes; session and `requireAuth` middleware; rate limiting on login.
- **Web client:** AuthContext, Login and Sign-up pages, route guard on checkout.
- No new services or infra.

## Risks & Unknowns

- The codebase is greenfield: the API, DB migrations and web app don't exist yet. This epic may need
  to scaffold them, or depend on whichever epic does.
- Cart merge: the guest cart must survive login. Where a guest cart lives is still open.
- Brute force and credential stuffing: need login rate limiting.
- CSRF with cookie sessions: SameSite plus origin checks.
- Email case-normalisation and uniqueness.
- No password reset at launch: locked-out users need manual support.

## Candidate Specs

- `register` — users and sessions tables, `POST /api/auth/register`, sign-up page, logged in automatically after sign-up.
- `login-logout` — login, logout and me endpoints, login page, AuthContext, session kept across visits, login rate limiting.
- `checkout-auth-gate` — `requireAuth` on the checkout API, redirect to log in or sign up and back to checkout, cart kept, account details available for "send to myself".
