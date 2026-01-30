import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { UserEntity } from '../user/user.entity';
import { ArticleEntity } from '../article/article.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommentResponse } from './types/commentResponse.interface';
import { ICommentsResponse } from './types/commentsResponse.interface';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createComment(
    user: UserEntity,
    slug: string,
    createCommentDto: CreateCommentDto,
  ): Promise<ICommentResponse> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const comment = new CommentEntity();
    Object.assign(comment, createCommentDto);
    comment.author = user;
    comment.article = article;

    const savedComment = await this.commentRepository.save(comment);

    return this.generateCommentResponse(savedComment);
  }

  async getComments(slug: string): Promise<ICommentsResponse> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const comments = await this.commentRepository.find({
      where: { article: { id: article.id } },
      order: { createdAt: 'DESC' },
    });

    return this.generateCommentsResponse(comments);
  }

  async deleteComment(
    slug: string,
    commentId: number,
    currentUserId: number,
  ): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, article: { id: article.id } },
      relations: ['author'],
    });

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.author.id !== currentUserId) {
      throw new HttpException(
        'You are not the author of this comment',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.commentRepository.remove(comment);
  }

  generateCommentResponse(comment: CommentEntity): ICommentResponse {
    return {
      comment,
    };
  }

  generateCommentsResponse(comments: CommentEntity[]): ICommentsResponse {
    return {
      comments,
    };
  }
}
