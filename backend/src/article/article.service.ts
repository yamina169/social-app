// Remplacement des imports avec la bonne syntaxe et chemins relatifs
import { ArticleEntity } from '../article/article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '../user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IArticleResponse } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { IArticlesResponse } from './types/articlesResponse.interface';
import { FollowEntity } from '@/profile/types/follow.entity';
import { MinioService } from '@/minio/minio.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private readonly minioService: MinioService,
  ) {}
  async findAll(currentUserId: number, query: any): Promise<IArticlesResponse> {
    const { tag, author, favorited, limit, offset } = query;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    // Filter by tag
    if (tag)
      queryBuilder.andWhere('articles.tagList LIKE :tag', { tag: `%${tag}%` });

    // Filter by author
    if (author) {
      const authorEntity = await this.userRepository.findOne({
        where: { username: author },
      });
      if (!authorEntity) return { articles: [], articlesCount: 0 };
      queryBuilder.andWhere('articles.authorId = :id', { id: authorEntity.id });
    }

    // Filter by favorited
    if (favorited) {
      const user = await this.userRepository.findOne({
        where: { username: favorited },
        relations: ['favorites'],
      });
      if (!user || user.favorites.length === 0)
        return { articles: [], articlesCount: 0 };
      const favoriteIds = user.favorites.map((a) => a.id);
      queryBuilder.andWhere('articles.id IN (:...ids)', { ids: favoriteIds });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (limit) queryBuilder.take(Number(limit));
    if (offset) queryBuilder.skip(Number(offset));

    const articles = await queryBuilder.getMany();

    // ✅ Replace presigned URLs with direct public URLs
    for (const article of articles) {
      if (article.image) {
        article.image = `http://localhost:9000/articles/${article.image}`;
        // Make sure article.image contains only the filename like 1769899630503-1.png
      }
    }

    // Handle current user's favorites
    let userFavoritesIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      userFavoritesIds = currentUser
        ? currentUser.favorites.map((a) => a.id)
        : [];
    }

    const articlesWithFavorited = articles.map((article) => ({
      ...article,
      favorited: userFavoritesIds.includes(article.id),
    }));

    return { articles: articlesWithFavorited, articlesCount };
  }

  async getFeed(currentUserId: number, query: any): Promise<IArticlesResponse> {
    const { limit, offset } = query;

    // 1️⃣ Find all users that the current user follows
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });

    if (!follows.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followingIds = follows.map((follow) => follow.followingId);

    // 2️⃣ Build query for articles only from followed authors
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...followingIds)', { followingIds })
      .orderBy('articles.createdAt', 'DESC');

    // 3️⃣ Get total count BEFORE pagination
    const articlesCount = await queryBuilder.getCount();

    // 4️⃣ Parse optional pagination params
    const take = limit !== undefined ? Number(limit) : undefined;
    const skip = offset !== undefined ? Number(offset) : undefined;

    if (typeof take === 'number' && !isNaN(take)) {
      queryBuilder.take(take);
    }

    if (typeof skip === 'number' && !isNaN(skip)) {
      queryBuilder.skip(skip);
    }

    // 5️⃣ Fetch articles
    const articles = await queryBuilder.getMany();

    // 6️⃣ Mark which articles are favorited by current user
    let userFavoritesIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });

      userFavoritesIds = currentUser
        ? currentUser.favorites.map((article) => article.id)
        : [];
    }

    const articlesWithFavorited = articles.map((article) => ({
      ...article,
      favorited: userFavoritesIds.includes(article.id),
    }));

    return { articles: articlesWithFavorited, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createArticleDto: CreateArticleDto,
    file?: Express.Multer.File, // fichier image
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    article.slug = this.generateSlug(article.title);
    article.author = user;
    if (!article.tagList) article.tagList = [];

    // Upload file to MinIO
    if (file) {
      const key = `articles/${Date.now()}-${file.originalname}`;
      await this.minioService.ensureBucketExists('articles'); // create bucket if not exists
      await this.minioService.uploadBuffer({
        bucket: 'articles',
        key,
        buffer: file.buffer,
        contentType: file.mimetype,
      });
      article.image = key; // save key in DB
    }

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

  async getSingleArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    if (article.image) {
      article.image = await this.minioService.getPresignedUrl(article.image);
    }

    return article;
  }

  // ------------------ Delete article ------------------
  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<{ message: string }> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    if (article.author.id !== currentUserId)
      throw new HttpException('Not author', HttpStatus.FORBIDDEN);

    // delete image from MinIO if exists
    if (article.image) {
      await this.minioService.deleteObject('articles', article.image);
    }

    await this.articleRepository.delete({ slug });
    return { message: 'Article deleted successfully' };
  }

  // ------------------ Helpers ------------------
  generateSlug(title: string) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    return `${slugify(title, { lower: true, strict: true })}-${id}`;
  }

  generateArticleResponse(article: ArticleEntity): IArticleResponse {
    return { article };
  }
}
