import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { ICommentResponse } from './types/commentResponse.interface';
import { ICommentsResponse } from './types/commentsResponse.interface';
import { User } from '@/user/decorators/user.decorators';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserEntity } from '../user/user.entity';

@ApiTags('Comments')
@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':slug/comments')
  @ApiOperation({ summary: 'Get all comments for an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article' })
  @ApiResponse({
    status: 200,
    description: 'List of comments retrieved successfully',
    type: Object, // ici on peut mettre un DTO ou interface si souhaité
  })
  async getComments(@Param('slug') slug: string): Promise<ICommentsResponse> {
    return await this.commentService.getComments(slug);
  }

  @Post(':slug/comments')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment for an article' })
  @ApiParam({ name: 'slug', description: 'Slug of the article' })
  @ApiBody({
    description: 'Payload for creating a new comment',
    schema: {
      type: 'object',
      properties: {
        comment: {
          type: 'object',
          properties: {
            body: { type: 'string', example: 'This is a comment body.' },
          },
          required: ['body'],
        },
      },
      required: ['comment'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      example: {
        comment: {
          id: 12,
          createdAt: '2025-07-10T10:30:00.000Z',
          updatedAt: '2025-07-10T10:30:00.000Z',
          body: 'This is a comment body.',
          author: {
            username: 'john_doe',
            bio: 'Developer & blogger',
            image: 'https://api.realworld.io/images/smiley-cyrus.jpeg',
            following: false,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createComment(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
  ): Promise<ICommentResponse> {
    return await this.commentService.createComment(
      user,
      slug,
      createCommentDto,
    );
  }

  @Delete(':slug/comments/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'slug', description: 'Slug of the article' })
  @ApiParam({ name: 'id', description: 'ID of the comment to delete' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteComment(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Param('id') commentId: number,
  ): Promise<void> {
    return await this.commentService.deleteComment(
      slug,
      commentId,
      currentUserId,
    );
  }
}
