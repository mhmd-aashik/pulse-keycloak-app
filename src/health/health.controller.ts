import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Public } from 'src/auth/public.decorator';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from 'src/database/schema';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  @Public()
  @Get()
  async getHealth() {
    await this.db.execute(sql`SELECT 1`);
    try {
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
