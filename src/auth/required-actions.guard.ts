import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedUser } from './authTypes';

@Injectable()
export class RequiredActionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    const user = request.user as AuthenticatedUser | undefined;
    if (user && user.requiredActions && user.requiredActions.length > 0) {
      throw new ForbiddenException(
        `Account setup required: please complete pending actions in Keycloak: ${user.requiredActions.join(', ')}`,
      );
    }
    return true;
  }
}
