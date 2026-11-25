/** User fields safe to return to the client (no password hash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Body of a successful register / login / refresh response. The access token is never in the body:
 * it is set as an httpOnly cookie.
 */
export interface AuthResponse {
  user: PublicUser;
}
