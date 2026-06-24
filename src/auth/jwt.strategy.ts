import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser, KeycloakTokenPayload } from './authTypes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const keycloakUrl =
      configService.get<string>('KEYCLOAK_URL') || 'http://localhost:8080';
    const realm = configService.get<string>('KEYCLOAK_REALM') || 'pulse';
    const jwksUri = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      algorithms: ['RS256'],
      issuer: `${keycloakUrl}/realms/${realm}`,
      audience: ['pulse-backend', 'pulse-spa'],
    });
  }

  validate(payload: KeycloakTokenPayload): AuthenticatedUser {
    return {
      keycloakId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      emailVerified: payload.email_verified,
      roles: payload.realm_access?.roles || [],
    };
  }
}
