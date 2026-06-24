/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FRESH_AUTH_KEY } from './fresh-auth.decorator';

@Injectable()
export class FreshAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireFresh = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_FRESH_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireFresh) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.authTime) {
      throw new ForbiddenException('Fresh authentication required');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeElapsed = currentTime - user.authTime;

    // Reject if authentication occurred more than 300 seconds (5 minutes) ago
    if (timeElapsed > 300) {
      throw new ForbiddenException('Fresh authentication required');
    }

    return true;
  }
}
