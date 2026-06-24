import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Get,
  Body,
} from '@nestjs/common';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CommentsService } from './comment.service';
import { CreateCommentDto } from './create-comment.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, postId, dto);
  }

  @Public()
  @Get(':postId')
  async findByPostId(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPostId(postId);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.delete(id, user.id, user.roles);
  }
}
