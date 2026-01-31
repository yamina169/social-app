import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { IArticleResponse } from './types/articleResponse.interface';
import { IArticlesResponse } from './types/articlesResponse.interface';
import { User } from '@/user/decorators/user.decorators';
import { UserEntity } from '@/user/user.entity';
import { AuthGuard } from '@/user/guards/auth.guard';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('image', { storage: multer.memoryStorage() }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create article with optional image' })
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
      file,
    );
    return this.articleService.generateArticleResponse(article);
  }

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('favorited') favorited?: string,
  ): Promise<IArticlesResponse> {
    return await this.articleService.findAll(currentUserId, {
      limit,
      offset,
      tag,
      author,
      favorited,
    });
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
    const article = await this.articleService.getSingleArticle(slug);
    return this.articleService.generateArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Get('feed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get articles feed from followed users' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @UseGuards(AuthGuard)
  async getUserFeed(
    @User('id') currentUserId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<IArticlesResponse> {
    const query = { limit, offset };
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Put(':slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article by slug' })
  @ApiParam({ name: 'slug' })
  @ApiBody({
    description: 'Payload for updating an article',
    schema: {
      example: {
        article: {
          title: 'Updated title',
          description: 'Updated description',
          body: 'Updated content...',
        },
      },
    },
  })
  @UseGuards(AuthGuard)
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<IArticleResponse> {
    const updatedArticle = await this.articleService.updateArticle(
      slug,
      currentUserId,
      updateArticleDto,
    );
    return this.articleService.generateArticleResponse(updatedArticle);
  }

  @Post(':slug/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add article to favorites' })
  @ApiParam({ name: 'slug' })
  @UseGuards(AuthGuard)
  async addToFavoriteArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const favoritedArticle = await this.articleService.addToFavoriteArticle(
      currentUserId,
      slug,
    );
    return this.articleService.generateArticleResponse(favoritedArticle);
  }

  @Delete(':slug/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove article from favorites' })
  @ApiParam({ name: 'slug' })
  @UseGuards(AuthGuard)
  async removeArticleFromFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const removedArticle = await this.articleService.removeArticleFromFavorites(
      currentUserId,
      slug,
    );
    return this.articleService.generateArticleResponse(removedArticle);
  }
}
