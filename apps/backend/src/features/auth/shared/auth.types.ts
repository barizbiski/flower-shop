import type { PublicUser } from '@flower-shop/shared';
import type { Request } from 'express';

// PublicUser and AuthResponse (the API contract) live in @flower-shop/shared.

/** A user row including the password hash — for credential checks only, never returned. */
export interface UserWithPasswordHash extends PublicUser {
  passwordHash: string;
}

/** Row data for inserting a user. */
export interface NewUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}

/** What register, login and refresh produce before responding: the user and their raw session token. */
export interface IssuedSession {
  user: PublicUser;
  /** Raw session token, for the access token's `sub` only; the DB keeps just its hash. */
  sessionToken: string;
}

/** What an access token carries. */
export interface AccessTokenClaims {
  /** Raw session token (`sub`). */
  sessionToken: string;
  /** User id (`uid`). */
  userId: string;
}

/** A request that passed JwtAuthGuard. */
export interface AuthenticatedRequest extends Request {
  userId: string;
}
