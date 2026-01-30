import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // GET /tags
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'List of tags',
    schema: { example: { tags: ['nestjs', 'nodejs', 'typescript'] } },
  })
  async getAll() {
    const allTags = await this.tagService.getAll();
    const tags: string[] = allTags.map((tag) => tag.name);
    return { tags };
  }

  // POST /tags
  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    schema: {
      example: { id: 1, name: 'nestjs', createdAt: '2026-01-30T12:00:00Z' },
    },
  })
  async create(@Body() body: { name: string }) {
    if (!body?.name || body.name.trim() === '') {
      throw new BadRequestException('Tag name is required');
    }
    return this.tagService.createTag(body.name);
  }
}
