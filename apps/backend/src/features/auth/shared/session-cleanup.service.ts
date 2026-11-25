import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsRepository } from './sessions.repo.js';

/**
 * Background housekeeping: physically deletes expired refresh-token rows every hour. Validity never
 * depends on this job — refresh checks `expires_at` itself, so an expired row that hasn't been
 * swept yet is already rejected.
 */
@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(@Inject(SessionsRepository) private readonly sessions: SessionsRepository) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'session-cleanup' })
  async deleteExpiredSessions(): Promise<number> {
    try {
      const deleted = await this.sessions.deleteExpired();
      if (deleted > 0) this.logger.log(`Deleted ${deleted} expired session(s)`);
      return deleted;
    } catch (err) {
      // A failed sweep is harmless (expired rows are rejected anyway); the next run retries.
      this.logger.error('Expired-session cleanup failed', err instanceof Error ? err.stack : String(err));
      return 0;
    }
  }
}
