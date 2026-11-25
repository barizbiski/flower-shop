/**
 * Returns `next` only if it is a same-site absolute path (e.g. "/checkout"); otherwise "/".
 * Rejects protocol-relative ("//host"), backslash tricks ("/\host"), and any scheme.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/';
  try {
    const url = new URL(next, 'http://same.invalid');
    if (url.origin !== 'http://same.invalid') return '/';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
}
