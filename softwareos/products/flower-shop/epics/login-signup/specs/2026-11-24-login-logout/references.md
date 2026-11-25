# References for Login & logout

## Related Specs

- **[Considered]** [2026-11-22-register](../2026-11-22-register/spec.md) — weak match: its body mentions `AuthProvider`. Dismissed in Step 4d: register created only a minimal provider seeded from the register response, and explicitly hands login, logout and `/me` to this spec.

## Similar Implementations

### Register endpoint

- **Location:** `apps/backend/src/features/auth/` — `shared/` (`sessions.repo.ts`, `users.repo.ts`, `session-cookie.ts`, `auth.constants.ts`, `auth.types.ts`, `helpers/token.ts`, `helpers/password.ts`) is reused by login; `register/` (`register.controller.ts`, `register.service.ts`, `register.schema.ts`) is the pattern to copy into a new `login/` folder.
- **Relevance:** Login, logout and `/me` live in the same NestJS module and reuse its session table, cookie and password helpers.
- **Key patterns:** zod `parse*` returning `{ ok, data | fields }`, `HttpError(status, code, message, fields?)`, repositories taking an optional `Queryable` for transactions, `setSessionCookie`, `verifyPassword`, `hashToken`.
- **Note (2026-11-25):** the cookie helper has since become `shared/access-cookie.ts` (`setAccessCookie`, `clearAuthCookies`, `readAccessToken`); `session-cookie.ts` / `refresh-cookie.ts` no longer exist.

### Sign-up form

- **Location:** `apps/frontend/src/features/auth/signup/`, `features/auth/api.ts`, `lib/apiClient.ts`, `utils/safeNext.ts`
- **Relevance:** The login form follows the same hook + form + page split, API result mapping and safe `?next=` redirect.

### API test helper

- **Location:** `apps/backend/test/helpers/testApp.ts`
- **Relevance:** Throwaway Postgres database per test file; the existing suites must keep passing.

### Design canvas — "My account" board

- **Location:** https://claude.ai/artifact/PdKd3SZELharkGgtHa5MwM, board `Account.dc.html`
- **Relevance:** The header account button and panel this spec builds.
- **Key patterns:** account button shows a person icon (logged out) or a 36px #7A2E4D initials circle (logged in), `aria-expanded`, `aria-haspopup="dialog"`; panel 330px wide, 22px radius, 1px #E6DED9 border, soft shadow, 22px padding. Logged out: "Welcome back" (DM Serif Display 26px), Email/Password labelled fields, "Log in" 48px pill, error text #A3243F `role="alert"`, "New here? Create an account". Logged in: 52px initials avatar, "Hello," + name (DM Serif 22px) + email, divider, "Log out" 46px secondary button with an exit icon.
