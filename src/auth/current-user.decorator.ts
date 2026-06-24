import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from './authTypes';

type RequestWithUser = Request & { user?: AuthenticatedUser };

export const CurrentUser = createParamDecorator<
  keyof AuthenticatedUser | undefined,
  AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] | undefined
>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;
  return data && user ? user[data] : user;
});
