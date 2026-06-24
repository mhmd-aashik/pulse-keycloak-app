import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

@Injectable()
export class ModerationService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto) {
    // 1. Verify that the reported content actually exists
    if (dto.contentType === 'post') {
      const post = await this.db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, dto.contentId))
        .limit(1);

      if (!post || post.length === 0) {
        throw new NotFoundException('Post not found');
      }
    } else if (dto.contentType === 'comment') {
      const comment = await this.db
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.id, dto.contentId))
        .limit(1);

      if (!comment || comment.length === 0) {
        throw new NotFoundException('Comment not found');
      }
    }

    // 2. Insert report
    const created = await this.db
      .insert(schema.reports)
      .values({
        reporterId,
        contentType: dto.contentType,
        contentId: dto.contentId,
        reason: dto.reason,
      })
      .returning();

    return created[0];
  }

  async findAll() {
    return await this.db
      .select({
        id: schema.reports.id,
        contentType: schema.reports.contentType,
        contentId: schema.reports.contentId,
        reason: schema.reports.reason,
        status: schema.reports.status,
        createdAt: schema.reports.createdAt,
        reporter: {
          id: schema.users.id,
          username: schema.users.username,
          avatar: schema.users.avatar,
        },
      })
      .from(schema.reports)
      .leftJoin(schema.users, eq(schema.reports.reporterId, schema.users.id))
      .orderBy(desc(schema.reports.createdAt));
  }

  async update(id: string, dto: UpdateReportDto) {
    const report = await this.db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, id))
      .limit(1);

    if (!report || report.length === 0) {
      throw new NotFoundException('Report not found');
    }

    const updated = await this.db
      .update(schema.reports)
      .set({
        status: dto.status,
      })
      .where(eq(schema.reports.id, id))
      .returning();

    return updated[0];
  }
}
