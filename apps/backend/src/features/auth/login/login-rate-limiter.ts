import { Injectable } from '@nestjs/common';
import { LOGIN_LIMITER_SWEEP_AT, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS } from './login.constants.js';

interface Window {
  failures: number;
  startedAt: number;
}

/**
 * Failed-login counter: a fixed 15-minute window per IP + email, started by the first failure.
 * After LOGIN_MAX_FAILURES failures the key is blocked until the window ends; a successful login
 * resets it.
 *
 * In memory, so it is per process: fine for the single-instance MVP, but it resets on restart and
 * would need a shared store (e.g. Redis) once the API runs on more than one instance.
 */
@Injectable()
export class LoginRateLimiter {
  private readonly windows = new Map<string, Window>();

  static key(ip: string, email: string): string {
    return `${ip}|${email}`;
  }

  isBlocked(key: string): boolean {
    const window = this.current(key);
    return !!window && window.failures >= LOGIN_MAX_FAILURES;
  }

  recordFailure(key: string): void {
    const window = this.current(key);
    if (window) {
      window.failures += 1;
      return;
    }
    if (this.windows.size >= LOGIN_LIMITER_SWEEP_AT) this.sweep();
    this.windows.set(key, { failures: 1, startedAt: Date.now() });
  }

  reset(key: string): void {
    this.windows.delete(key);
  }

  /** The key's window if it is still open; drops it once it has passed. */
  private current(key: string): Window | undefined {
    const window = this.windows.get(key);
    if (window && Date.now() - window.startedAt >= LOGIN_WINDOW_MS) {
      this.windows.delete(key);
      return undefined;
    }
    return window;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [key, window] of this.windows) {
      if (now - window.startedAt >= LOGIN_WINDOW_MS) this.windows.delete(key);
    }
  }
}
