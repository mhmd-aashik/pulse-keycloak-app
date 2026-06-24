import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Post('logout')
  async logout(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL') || '';
    const realm = this.configService.get<string>('KEYCLOAK_REALM') || '';
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
    const clientSecret =
      this.configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '';

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);

    const response = await fetch(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to logout session in Keycloak');
    }

    return { success: true };
  }
}
