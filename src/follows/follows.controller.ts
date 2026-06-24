import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { FollowsService } from './follows.service';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id/follow')
  async follow(
    @Param('id', ParseUUIDPipe) followingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.followsService.follow(user.id, followingId);
  }

  @Post(':id/unfollow')
  async unfollow(
    @Param('id', ParseUUIDPipe) followingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.followsService.unfollow(user.id, followingId);
  }
}
