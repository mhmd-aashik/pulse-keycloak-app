import { Injectable, Inject } from '@nestjs/common';
import { eq, ilike, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class SearchService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async search(q: string) {
    if (!q || q.trim() === '') {
      return {
        users: [],
        posts: [],
      };
    }

    const searchQuery = `%${q}%`;

    // 1. Search Users
    const matchedUsers = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        bio: schema.users.bio,
        avatar: schema.users.avatar,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(
        or(
          ilike(schema.users.username, searchQuery),
          ilike(schema.users.bio, searchQuery),
        ),
      );

    // 2. Search Posts
    const matchedPosts = await this.db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        content: schema.posts.content,
        createdAt: schema.posts.createdAt,
        updatedAt: schema.posts.updatedAt,
        authorId: schema.posts.authorId,
        author: {
          id: schema.users.id,
          username: schema.users.username,
          avatar: schema.users.avatar,
        },
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
      .where(
        or(
          ilike(schema.posts.title, searchQuery),
          ilike(schema.posts.content, searchQuery),
        ),
      );

    return {
      users: matchedUsers,
      posts: matchedPosts,
    };
  }
}
