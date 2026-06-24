import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq } from 'drizzle-orm';
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
}
