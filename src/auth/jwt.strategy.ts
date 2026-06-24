import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser, KeycloakTokenPayload } from './authTypes';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const keycloakUrl =
      configService.get<string>('KEYCLOAK_URL') || 'http://localhost:8080';
    const realm = configService.get<string>('KEYCLOAK_REALM') || 'pulse';
    const jwksUri = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;
    const backendClientId =
      configService.get<string>('KEYCLOAK_CLIENT_ID') || 'pulse-backend';
    const audiencesRaw = configService.get<string>('KEYCLOAK_AUDIENCES');
    const audiences = (
      audiencesRaw
        ? audiencesRaw.split(',').map((s) => s.trim())
        : [backendClientId, 'pulse-spa', 'account']
    ).filter(Boolean);

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
      audience: audiences,
    });
  }

  async validate(payload: KeycloakTokenPayload): Promise<AuthenticatedUser> {
    const username =
      payload.preferred_username || `user_${payload.sub.substring(0, 8)}`;
    const dbUser = await this.usersService.findOrCreate(payload.sub, username);

    return {
      id: dbUser.id,
      keycloakId: dbUser.keycloakId,
      username: dbUser.username,
      bio: dbUser.bio || '',
      avatar: dbUser.avatar || '',
      email: payload.email,
      emailVerified: payload.email_verified,
      roles: payload.roles || payload.realm_access?.roles || [],
      requiredActions: payload.required_actions || [],
    };
  }
}
