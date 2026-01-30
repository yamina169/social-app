import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from '@/user/user.entity';
import { FollowEntity } from '@/profile/types/follow.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowEntity]), // Add UserEntity here
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
