/** First word of a full name, e.g. "Dana Levi" → "Dana". */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
