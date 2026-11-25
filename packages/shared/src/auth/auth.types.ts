/** User fields safe to return to the client (no password hash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/** Body of a successful register / login / refresh response. */
export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}
