import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new article' })
  @ApiBody({
    description: 'Payload for creating a new article',
    schema: {
      example: {
        article: {
          title: 'How to use NestJS',
          description: 'Learn how to create a backend using NestJS',
          body: 'Full guide content here...',
          tagList: ['nestjs', 'backend'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleResponse> {
    const newArticle = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.generateArticleResponse(newArticle);
  }

  @Get('feed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get articles feed from followed users' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @UseGuards(AuthGuard)
  async getUserFeed(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<IArticlesResponse> {
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Get()
  @ApiOperation({ summary: 'List all articles with optional filters' })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'favorited', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<IArticlesResponse> {
    return this.articleService.findAll(currentUserId, query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiParam({ name: 'slug' })
  async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
    const article = await this.articleService.getSingleArticle(slug);
    return this.articleService.generateArticleResponse(article);
  }

  @Delete(':slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete article by slug' })
  @ApiParam({ name: 'slug' })
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
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
    const removeArticle = await this.articleService.removeArticleFromFavorites(
      currentUserId,
      slug,
    );
    return this.articleService.generateArticleResponse(removeArticle);
  }
}
