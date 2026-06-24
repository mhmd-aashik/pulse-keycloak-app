import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOrCreate(keycloakId: string, username: string) {
    const existingUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.keycloakId, keycloakId))
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      return existingUser[0];
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
}
