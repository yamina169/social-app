// Remplacement des imports avec la bonne syntaxe et chemins relatifs
import { ArticleEntity } from '../article/article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '../user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { IArticleResponse } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { IArticlesResponse } from './types/articlesResponse.interface';
import { FollowEntity } from '@/profile/types/follow.entity';
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async findAll(currentUserId: number, query: any): Promise<IArticlesResponse> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.author,
        },
      });
      if (author) {
        queryBuilder.andWhere('articles.authorId = :id', {
          id: author?.id,
        });
      } else {
        return { articles: [], articlesCount: 0 };
      }
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.favorited,
        },
        relations: ['favorites'],
      });
      if (!author || author.favorites.length === 0) {
        return { articles: [], articlesCount: 0 };
      }

      const favoritesIds = author?.favorites.map((articles) => articles.id);

      queryBuilder.andWhere('articles.id IN (:...ids)', { ids: favoritesIds });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    let userFavoritesIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: {
          id: currentUserId,
        },
        relations: ['favorites'],
      });
      userFavoritesIds = currentUser
        ? currentUser.favorites.map((article) => article.id)
        : [];
    }

    const articlesWithFavorited = articles.map((article) => {
      const favorited = userFavoritesIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async getFeed(currentUserId: number, query: any): Promise<IArticlesResponse> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });

    const followingIds = follows.map((follow) => follow.followingId);

    if (!follows.length) {
      return { articles: [], articlesCount: 0 };
    }

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.andWhere('articles.authorId IN (:...followingIds)', {
      followingIds,
    });
    const articlesCount = await queryBuilder.getCount();

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();

    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.generateSlug(article.title);
    article.author = user;

    return await this.articleRepository.save(article);
  }

  async addToFavoriteArticle(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    // Find user with favorites relation
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${currentUserId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Find the article by slug
    const currentArticle = await this.findBySlug(slug);

    // Vérifier si l'article est déjà dans les favoris de l'utilisateur
    const isNotFavorite = !user.favorites.find(
      (article) => article.slug === currentArticle.slug,
    );

    if (isNotFavorite) {
      // Increment favorites count
      currentArticle.favoritesCount++;

      // Add article to user's favorites
      user.favorites.push(currentArticle);

      // Save changes
      await this.articleRepository.save(currentArticle);
      await this.userRepository.save(user);
    }

    return currentArticle;
  }

  async removeArticleFromFavorites(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: currentUserId,
      },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${currentUserId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const currentArticle = await this.findBySlug(slug);

    const articleIndex = user.favorites.findIndex(
      (article) => article.slug === currentArticle.slug,
    );

    if (articleIndex >= 0) {
      currentArticle.favoritesCount--;
      user.favorites.splice(articleIndex, 1);
      await this.articleRepository.save(currentArticle);
      await this.userRepository.save(user);
    }
    console.log(user);

    return currentArticle;
  }

  async getSingleArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    return article; // Type 'ArticleEntity | null' is not assignable to type 'ArticleEntity'.
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<{ message: string }> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You are not an author. What the hell are you going to delete?',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.articleRepository.delete({ slug });

    return {
      message: 'Article deleted successfully',
    };
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You are not an author. What the hell are you going to update?',
        HttpStatus.FORBIDDEN,
      );
    }

    if (updateArticleDto.title) {
      article.slug = this.generateSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: {
        slug,
      },
    });
    if (!article) {
      throw new HttpException('Article is not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  generateSlug(title: string): string {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    return `${slugify(title, { lower: true, strict: true })}-${id}`;
  }

  generateArticleResponse(article: ArticleEntity): IArticleResponse {
    return {
      article,
    };
  }
}
