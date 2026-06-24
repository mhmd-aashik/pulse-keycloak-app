import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { eq, asc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { CreateCommentDto } from './create-comment.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { posts } from '../database/schema';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(authorId: string, postId: string, dto: CreateCommentDto) {
    // 1. Verify post exists
    const post = await this.db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      throw new NotFoundException('Post not found');
    }

    // 2. Insert comment
    const inserted = await this.db
      .insert(schema.comments)
      .values({
        content: dto.content,
        authorId,
        postId,
      })
      .returning();

    const commentRow = inserted[0];

    // 3. Return comment with author details
    const author = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        avatar: schema.users.avatar,
      })
      .from(schema.users)
      .where(eq(schema.users.id, authorId))
      .limit(1);

    return {
      ...commentRow,
      author: author[0],
    };
  }

  async findByPostId(postId: string) {
    // 1. Verify post exists
    const post = await this.db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      throw new NotFoundException('Post not found');
    }

    // 2. Get comments
    return this.db
      .select({
        id: schema.comments.id,
        content: schema.comments.content,
        authorId: schema.comments.authorId,
        postId: schema.comments.postId,
        createdAt: schema.comments.createdAt,
        updatedAt: schema.comments.updatedAt,
        author: {
          id: schema.users.id,
          username: schema.users.username,
          avatar: schema.users.avatar,
        },
      })
      .from(schema.comments)
      .innerJoin(schema.users, eq(schema.comments.authorId, schema.users.id))
      .where(eq(schema.comments.postId, postId))
      .orderBy(asc(schema.comments.createdAt));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(id: string, userId: string, roles: string[] = []) {
    const comment = await this.db
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.id, id))
      .limit(1);

    if (!comment || comment.length === 0) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment[0].authorId === userId;

    if (!isAuthor) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }

    await this.db.delete(schema.comments).where(eq(schema.comments.id, id));

    return { success: true };
  }
}
