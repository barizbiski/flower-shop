# Tasks — Login & logout

> Epic: login-signup
> Spec: 2026-11-24-login-logout
> Branch: feat/login

## API — features/auth (PR 1)

- [ ] T1 Error codes INVALID_CREDENTIALS, UNAUTHENTICATED, RATE_LIMITED (common/constants/error-codes.ts) + login/login.constants.ts (LOGIN_MESSAGES, 5 failures / 15 min)
- [ ] T2 login/login.schema.ts + login/login.types.ts: zod validation, trim/lowercase email
- [ ] T3 shared/users.repo.ts findByEmail; shared/sessions.repo.ts (refresh-token hashes) findUserByToken, deleteByToken and rotate
- [ ] T4 shared/refresh-cookie.ts (renamed from session-cookie.ts): setRefreshCookie / clearRefreshCookie (refresh_token, Path=/api/auth) and readRefreshToken (cookie or body); rename constants to REFRESH_COOKIE / REFRESH_TTL_MS
- [ ] T5 login/login.service.ts: LoginService login (dummy-hash timing guard, replaces an existing refresh token, issues tokens), refresh, logout, me
- [ ] T6 login/login-rate-limiter.ts: LoginRateLimiter provider, 5 failures per ip+email per 15 min, reset on success → 429
- [ ] T7 login/login.controller.ts: POST /auth/login (200), POST /auth/logout (204), GET /auth/me behind JwtAuthGuard (200/401); register in auth.module.ts
- [ ] T15 JWT setup: @nestjs/jwt, JWT_ACCESS_SECRET in AppConfig (required, placeholder in .env.example, dummy in test setup), shared/access-token.service.ts sign/verify (HS256, sub, 15 min)
- [ ] T16 shared/jwt-auth.guard.ts: JwtAuthGuard (Bearer header → user id on request, else 401 UNAUTHENTICATED)
- [ ] T17 POST /auth/refresh (200 { accessToken, user } / 401): rotate refresh token, set new cookie; shared/token-issuer.service.ts TokenIssuer shared by register, login and refresh
- [ ] T18 Register returns 201 { accessToken, user } and sets refresh_token instead of sid; update register.test.ts

## Web (PR 2)

- [ ] T8 apiClient getJson; loginUser, refreshSession, logoutUser, fetchMe in features/auth/api.ts; registerUser stores accessToken; routes in constants/api.ts
- [ ] T9 AuthProvider: access token in memory only, call /refresh on mount with loading status, expose logout()
- [ ] T10 features/auth/login/: useLoginForm, LoginForm (client validation, 401/429 messages)
- [ ] T11 LoginPage at /login with safe ?next= redirect; route in App.tsx
- [ ] T12 AccountMenu (header button + panel, logged-out form / logged-in name, email, Log out), canvas styling, Escape/outside click closes; wire into Header.tsx
- [ ] T13 Update Header.test.tsx and App.test.tsx for the new header (mock /refresh) so the existing suite passes
- [ ] T19 apiClient: Bearer header from the in-memory access token; on 401 one shared refresh then retry; on refresh failure clear token and log out (auth endpoints never retried)

## Verification

- [ ] T14 Run QA against acceptance criteria (qa skill)
