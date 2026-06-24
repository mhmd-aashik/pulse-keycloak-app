import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import type { AuthenticatedUser } from 'src/auth/authTypes';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { Public } from 'src/auth/public.decorator';
import { UpdatePostDto } from './dto/update-post.dto';

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

  @Public()
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const post = await this.postsService.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, updatePostDto);
  }
}
