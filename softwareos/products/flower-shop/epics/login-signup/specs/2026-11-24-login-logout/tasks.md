# Tasks — Login & logout

> Epic: login-signup
> Spec: 2026-11-24-login-logout
> Branch: feat/login

## API — features/auth (PR 1)

- [ ] T1 Error codes INVALID_CREDENTIALS, UNAUTHENTICATED, RATE_LIMITED (common/constants/error-codes.ts) + login/login.constants.ts (LOGIN_MESSAGES, 5 failures / 15 min)
- [ ] T2 login/login.schema.ts + login/login.types.ts: zod validation, trim/lowercase email
- [ ] T3 shared/users.repo.ts findByEmail; shared/sessions.repo.ts findUserByToken and deleteByToken
- [ ] T4 shared/session-cookie.ts: clearSessionCookie and readSessionToken
- [ ] T5 login/login.service.ts: LoginService login (dummy-hash timing guard, replaces an existing session), logout, me
- [ ] T6 login/login-rate-limiter.ts: LoginRateLimiter provider, 5 failures per ip+email per 15 min, reset on success → 429
- [ ] T7 login/login.controller.ts: POST /auth/login (200), POST /auth/logout (204), GET /auth/me (200/401); register in auth.module.ts

## Web (PR 2)

- [ ] T8 apiClient getJson; loginUser, logoutUser, fetchMe in features/auth/api.ts; routes in constants/api.ts
- [ ] T9 AuthProvider: load /me on mount with loading status, expose logout()
- [ ] T10 features/auth/login/: useLoginForm, LoginForm (client validation, 401/429 messages)
- [ ] T11 LoginPage at /login with safe ?next= redirect; route in App.tsx
- [ ] T12 AccountMenu (header button + panel, logged-out form / logged-in name, email, Log out), canvas styling, Escape/outside click closes; wire into Header.tsx
- [ ] T13 Update Header.test.tsx and App.test.tsx for the new header (mock /me) so the existing suite passes

## Verification

- [ ] T14 Run QA against acceptance criteria (qa skill)
