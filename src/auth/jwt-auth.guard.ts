import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  override handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: any,
  ): TUser {
    if (err || !user) {
      let message = 'Unauthorized';
      if (info instanceof Error) {
        if (info.name === 'TokenExpiredError') {
          message = 'Token has expired';
        } else if (info.name === 'JsonWebTokenError') {
          message = 'Invalid token';
        } else {
          message = info.message;
        }
      } else if (info && typeof info === 'object' && 'message' in info) {
        const infoMsg = String((info as Record<string, unknown>).message);
        if (infoMsg.includes('No auth token')) {
          message = 'Missing authentication token';
        } else {
          message = infoMsg;
        }
      } else if (!info) {
        message = 'Missing authentication token';
      }

      throw err || new UnauthorizedException(message);
    }
    return user as TUser;
  }
}
