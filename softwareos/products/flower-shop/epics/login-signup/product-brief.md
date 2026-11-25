# User Accounts — Product Brief

> Epic: epic.md · Product: ../../mission.md

## Goals

Checkout requires an account, and today there is no way to have one. This epic lets shoppers:

- Sign up with name, email, phone and password.
- Log in and log out.
- Stay logged in across visits.
- Store their personal details so checkout's "send to myself" can fill in the recipient.
- Every buyer becomes a registered user (deliberate trade-off against some last-minute buyers).

## User Stories

- As a new shopper, I can sign up with name, email, phone and password so I can check out.
- As a returning shopper, I can log in so my details are filled in for me.
- As a logged-in shopper, I stay logged in across visits and can log out.
- As a shopper at checkout, I'm asked to log in or sign up without losing my cart.
- As a shopper sending flowers to myself, "send to myself" uses my account details.

## Success Criteria

- A new user can sign up and lands logged in.
- Signing up with an already-registered email is rejected with a clear message.
- Wrong credentials show a generic error that doesn't reveal whether the email exists.
- The session survives a page reload and a browser restart, until logout.
- Checkout and its API refuse unauthenticated users.
- Passwords are stored only as hashes.
- The cart is kept through login or sign-up.

## Out of Scope

- Password reset by email (needs an email provider, TBD).
