import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CommentsService } from './comment.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CommentController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentModule {}
