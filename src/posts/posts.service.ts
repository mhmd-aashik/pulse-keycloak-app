import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { desc, eq } from 'drizzle-orm';

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

  async getFeed() {
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
      .orderBy(desc(schema.posts.createdAt));

    return result;
  }
}
