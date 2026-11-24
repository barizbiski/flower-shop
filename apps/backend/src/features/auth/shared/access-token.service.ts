import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_ALGORITHM } from './auth.constants.js';

interface AccessTokenPayload {
  sub: string;
}

/**
 * Short-lived access tokens: HS256 JWTs with `sub` = user id. Secret and 15-minute expiry are
 * configured on JwtModule in auth.module.ts. Stateless — not stored, not revocable before expiry.
 */
@Injectable()
export class AccessTokenService {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  sign(userId: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId } satisfies AccessTokenPayload);
  }

  /** The user id of a valid, unexpired token signed with our secret; null for anything else. */
  async verify(token: string): Promise<string | null> {
    try {
      const payload = await this.jwt.verifyAsync<Partial<AccessTokenPayload>>(token, {
        algorithms: [ACCESS_TOKEN_ALGORITHM],
      });
      return typeof payload.sub === 'string' && payload.sub ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
