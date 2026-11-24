/** User fields safe to return to the client (no password hash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/** Row data for inserting a user. */
export interface NewUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}
