// Credential and profile rules enforced by the API and checked by the web forms before submitting.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_MAX_LENGTH = 254;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const NAME_MAX_LENGTH = 100;

export const PHONE_RE = /^\+?\d{9,15}$/;
/** Spaces and dashes users type in phone numbers; stripped before validating. */
export const PHONE_SEPARATORS_RE = /[\s-]/g;
