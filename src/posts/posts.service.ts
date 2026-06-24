import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { desc, eq, lt } from 'drizzle-orm';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostFeedQueryDto } from './dto/post-feed-query.dto';

@Injectable()
export class PostsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const created = await this.db
      .insert(schema.posts)
      .values({
        authorId,
        title: dto.title,
        content: dto.content,
      })
      .returning();

    return created[0];
  }

  async getFeed(query: PostFeedQueryDto) {
    const limit = query.limit ?? 10;
    const cursor = query.cursor;

    const queryBuilder = this.db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        content: schema.posts.content,
        authorId: schema.posts.authorId,
        createdAt: schema.posts.createdAt,
        updatedAt: schema.posts.updatedAt,
        author: {
          id: schema.users.id,
          username: schema.users.username,
          avatar: schema.users.avatar,
        },
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id));

    if (cursor) {
      queryBuilder.where(lt(schema.posts.createdAt, new Date(cursor)));
    }

    const result = await queryBuilder
      .orderBy(desc(schema.posts.createdAt))
      .limit(limit + 1);

    const hasNextPage = result.length > limit;
    const data = hasNextPage ? result.slice(0, limit) : result;
    const nextCursor = hasNextPage
      ? data[data.length - 1].createdAt.toISOString()
      : null;

    return {
      data,
      nextCursor,
    };
  }

  async findById(id: string) {
    const result = await this.db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        content: schema.posts.content,
        authorId: schema.posts.authorId,
        createdAt: schema.posts.createdAt,
        updatedAt: schema.posts.updatedAt,
        author: {
          id: schema.users.id,
          username: schema.users.username,
          avatar: schema.users.avatar,
        },
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
      .where(eq(schema.posts.id, id))
      .limit(1);

    return result && result.length > 0 ? result[0] : null;
  }

  async update(id: string, authorId: string, dto: UpdatePostDto) {
    const post = await this.db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, id))
      .limit(1);

    if (!post || post.length === 0) {
      throw new NotFoundException('Post not found');
    }

    if (post[0].authorId !== authorId) {
      throw new ForbiddenException('You are not authorized to edit this post');
    }

    const updated = await this.db
      .update(schema.posts)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.posts.id, id))
      .returning();

    return updated[0];
  }

  async delete(id: string, authorId: string, roles: string[] = []) {
    const post = await this.db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, id))
      .limit(1);

    if (!post || post.length === 0) {
      throw new NotFoundException('Post not found');
    }

    const isAuthor = post[0].authorId === authorId;
    const isModeratorOrAdmin =
      roles.includes('moderator') || roles.includes('admin');

    if (!isAuthor && !isModeratorOrAdmin) {
      throw new ForbiddenException(
        'You are not authorized to delete this post',
      );
    }

    await this.db.delete(schema.posts).where(eq(schema.posts.id, id));

    return { success: true };
  }
}
