import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from 'src/database/schema';

@Injectable()
export class FollowsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // verify that the follower and following exist
    const targetUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, followerId))
      .limit(1);

    if (!targetUser || targetUser.length === 0) {
      throw new NotFoundException('Target user not found');
    }

    if (!targetUser || targetUser.length === 0) {
      throw new NotFoundException('Target user not found');
    }

    // Check if already following
    const existing = await this.db
      .select()
      .from(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, followerId),
          eq(schema.follows.followingId, followingId),
        ),
      )
      .limit(1);

    if (existing && existing.length > 0) {
      throw new BadRequestException('You are already following this user');
    }

    await this.db.insert(schema.follows).values({
      followerId,
      followingId,
    });

    return { success: true };
  }

  async unfollow(followerId: string, followingId: string) {
    // verify that the follower and following exist
    const existing = await this.db
      .select()
      .from(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, followerId),
          eq(schema.follows.followingId, followingId),
        ),
      )
      .limit(1);

    if (existing && existing.length > 0) {
      throw new BadRequestException('You are not following this user');
    }

    await this.db
      .delete(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, followerId),
          eq(schema.follows.followingId, followingId),
        ),
      );

    return { success: true };
  }
}
