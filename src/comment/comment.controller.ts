import { Controller, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CommentsService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentsService: CommentsService) {}

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.delete(id, user.id, user.roles);
  }
}
