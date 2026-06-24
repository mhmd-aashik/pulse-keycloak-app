import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
