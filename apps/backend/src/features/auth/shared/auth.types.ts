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

/** What register and login produce before responding: the user and their new raw refresh token. */
export interface IssuedSession {
  user: PublicUser;
  /** Raw refresh token, for the cookie only. */
  refreshToken: string;
}

/** A request that passed JwtAuthGuard. */
export interface AuthenticatedRequest extends Request {
  userId: string;
}
