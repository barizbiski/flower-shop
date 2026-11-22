// Mirrors apps/api/src/auth/register.schema.ts — keep rules and messages in sync.

export interface SignupValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type SignupField = keyof SignupValues;
export type SignupErrors = Partial<Record<SignupField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{9,15}$/;

export function validateSignup(v: SignupValues): SignupErrors {
  const errors: SignupErrors = {};
  const name = v.name.trim();
  if (!name) errors.name = 'Please enter your name';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or fewer';

  const email = v.email.trim();
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Please enter a valid email address';

  if (!PHONE_RE.test(v.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Please enter a valid phone number (9–15 digits)';
  }

  if (v.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (v.password.length > 128) errors.password = 'Password must be 128 characters or fewer';

  return errors;
}
