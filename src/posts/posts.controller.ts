import { Body, Controller, Get, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(user.id, createPostDto);
  }

  @Public()
  @Get()
  async getFeed() {
    return this.postsService.getFeed();
  }
}
