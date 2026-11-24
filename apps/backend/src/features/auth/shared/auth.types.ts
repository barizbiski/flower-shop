import type { Request } from 'express';

/** User fields safe to return to the client (no password hash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

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

/** What register, login and refresh produce before responding: the user and their new raw refresh token. */
export interface IssuedSession {
  user: PublicUser;
  /** Raw refresh token, for the cookie only. */
  refreshToken: string;
}

/** Body of a successful register / login / refresh response. */
export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

/** A request that passed JwtAuthGuard. */
export interface AuthenticatedRequest extends Request {
  userId: string;
}
