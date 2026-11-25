import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_ALGORITHM } from './auth.constants.js';
import type { AccessTokenClaims } from './auth.types.js';

interface AccessTokenPayload {
  /** Raw session token; its SHA-256 is the `sessions` row id. */
  sub: string;
  /** User id. */
  uid: string;
}

/**
 * Short-lived access tokens: HS256 JWTs with `sub` = the session token and `uid` = the user id.
 * Secret and 15-minute expiry are configured on JwtModule in auth.module.ts. Protected routes trust
 * an unexpired token without a DB lookup; refresh and logout look up its session by `sub`.
 */
@Injectable()
export class AccessTokenService {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  sign({ sessionToken, userId }: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync({ sub: sessionToken, uid: userId } satisfies AccessTokenPayload);
  }

  /** Claims of a valid, unexpired token signed with our secret; null for anything else. */
  verify(token: string): Promise<AccessTokenClaims | null> {
    return this.decode(token, false);
  }

  /**
   * Claims of a token signed with our secret, even if it has expired — only for finding its
   * session (refresh, logout), never for authorising a request.
   */
  verifyIgnoringExpiry(token: string): Promise<AccessTokenClaims | null> {
    return this.decode(token, true);
  }

  private async decode(token: string, ignoreExpiration: boolean): Promise<AccessTokenClaims | null> {
    try {
      const payload = await this.jwt.verifyAsync<Partial<AccessTokenPayload>>(token, {
        algorithms: [ACCESS_TOKEN_ALGORITHM],
        ignoreExpiration,
      });
      const { sub, uid } = payload;
      if (typeof sub !== 'string' || !sub || typeof uid !== 'string' || !uid) return null;
      return { sessionToken: sub, userId: uid };
    } catch {
      return null;
    }
  }
}
