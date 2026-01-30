import { CommentController } from './comment.controller';
import { CommentEntity } from './comment.entity';
import { CommentService } from './comment.service';
import { ArticleEntity } from '../article/article.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, ArticleEntity])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
