import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedUser } from 'src/auth/authTypes';

@Catch(ForbiddenException)
export class AuditExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('AuditLog');

  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user: AuthenticatedUser }>();
    const status = exception.getStatus();

    const user = request.user;
    const auditMessage = {
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      username: user?.username || 'anonymous',
      roles: user?.roles || [],
      action: request.method,
      path: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      message: exception.message,
    };

    this.logger.warn(`ACCESS DENIED: ${JSON.stringify(auditMessage)}`);

    response.status(status).json(exception.getResponse());
  }
}
