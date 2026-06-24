import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';

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
}
