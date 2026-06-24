import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    recipientId: string,
    senderId: string,
    type: string,
    targetId: string,
  ) {
    if (recipientId === senderId) {
      return null;
    }

    const inserted = await this.db
      .insert(schema.notifications)
      .values({
        recipientId,
        senderId,
        type,
        targetId,
      })
      .returning();

    return inserted[0];
  }

  async findAll(recipientId: string) {
    return await this.db
      .select({
        id: schema.notifications.id,
        recipientId: schema.notifications.recipientId,
        senderId: schema.notifications.senderId,
        type: schema.notifications.type,
        targetId: schema.notifications.targetId,
        read: schema.notifications.read,
        createdAt: schema.notifications.createdAt,
        sender: {
          id: schema.users.id,
          username: schema.users.username,
          avatar: schema.users.avatar,
        },
      })
      .from(schema.notifications)
      .innerJoin(
        schema.users,
        eq(schema.notifications.senderId, schema.users.id),
      )
      .where(eq(schema.notifications.recipientId, recipientId))
      .orderBy(desc(schema.notifications.createdAt));
  }

  async markAsRead(id: string, recipientId: string) {
    const list = await this.db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, id))
      .limit(1);

    if (!list || list.length === 0) {
      throw new NotFoundException('Notification not found');
    }

    if (list[0].recipientId !== recipientId) {
      throw new ForbiddenException('You cannot modify this notification');
    }

    const updated = await this.db
      .update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.id, id))
      .returning();

    return updated[0];
  }
}
