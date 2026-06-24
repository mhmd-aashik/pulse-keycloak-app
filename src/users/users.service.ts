import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { desc, eq, sql } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreate(keycloakId: string, username: string) {
    const existingUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.keycloakId, keycloakId))
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      const user = existingUser[0];
      if (user.username !== username) {
        const updatedUser = await this.db
          .update(schema.users)
          .set({ username, updatedAt: new Date() })
          .where(eq(schema.users.keycloakId, keycloakId))
          .returning();
        return updatedUser[0];
      }
      return user;
    }

    const created = await this.db
      .insert(schema.users)
      .values({
        keycloakId,
        username,
      })
      .returning();

    return created[0];
  }

  async findByKeycloakId(keycloakId: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.keycloakId, keycloakId))
      .limit(1);

    return result && result.length > 0 ? result[0] : null;
  }

  async update(id: string, values: { bio?: string; avatar?: string }) {
    const updated = await this.db
      .update(schema.users)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    return updated[0];
  }

  async findAll() {
    return await this.db.select().from(schema.users);
  }

  async getAdminToken(): Promise<string> {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL') || '';
    const realm = this.configService.get<string>('KEYCLOAK_REALM') || '';
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
    const clientSecret =
      this.configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '';

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await fetch(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get admin token: ${response.statusText}`);
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  async getSessions(keycloakId: string) {
    const token = await this.getAdminToken();
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL') || '';
    const realm = this.configService.get<string>('KEYCLOAK_REALM') || '';

    const response = await fetch(
      `${keycloakUrl}/admin/realms/${realm}/users/${keycloakId}/sessions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user sessions: ${response.statusText}`);
    }

    return (await response.json()) as { sessions: { id: string }[] };
  }

  async delete(id: string) {
    return await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();
  }

  async getProfile(userId: string, currentUserId?: string) {
    // 1. Fetch user profile
    const userResult = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      throw new NotFoundException('User not found');
    }

    // 2. Count followers
    const followersCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followingId, userId));

    // 3. Count following
    const followingCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followerId, userId));

    // 4. Count posts
    const postsCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.posts)
      .where(eq(schema.posts.authorId, userId));

    // 5. Fetch their posts (with joins)
    const likesSubquery = this.db
      .select({
        postId: schema.likes.postId,
        count: sql<number>`count(*)::int`.as('likes_count'),
      })
      .from(schema.likes)
      .groupBy(schema.likes.postId)
      .as('likes_sub');

    const commentsSubquery = this.db
      .select({
        postId: schema.comments.postId,
        count: sql<number>`count(*)::int`.as('comments_count'),
      })
      .from(schema.comments)
      .groupBy(schema.comments.postId)
      .as('comments_sub');

    const userPosts = await this.db
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
        likesCount: sql<number>`coalesce(${likesSubquery.count}, 0)`,
        commentsCount: sql<number>`coalesce(${commentsSubquery.count}, 0)`,
        isLiked: currentUserId
          ? sql<boolean>`exists(select 1 from ${schema.likes} where ${schema.likes.postId} = ${schema.posts.id} and ${schema.likes.userId} = ${currentUserId}::uuid)`
          : sql<boolean>`false`,
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
      .leftJoin(likesSubquery, eq(schema.posts.id, likesSubquery.postId))
      .leftJoin(commentsSubquery, eq(schema.posts.id, commentsSubquery.postId))
      .where(eq(schema.posts.authorId, userId))
      .orderBy(desc(schema.posts.createdAt));

    return {
      user: userResult[0],
      followersCount: Number(followersCountResult[0]?.count || 0),
      followingCount: Number(followingCountResult[0]?.count || 0),
      postsCount: Number(postsCountResult[0]?.count || 0),
      posts: userPosts,
    };
  }
}
