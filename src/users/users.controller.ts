import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UpdateProfileDto } from './update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.update(user.id, updateProfileDto);
    return {
      ...user,
      bio: updated.bio,
      avatar: updated.avatar,
    };
  }
}
