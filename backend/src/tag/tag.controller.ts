import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tags') // Groupe dans Swagger
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'List of tags',
    schema: {
      example: { tags: ['nestjs', 'nodejs', 'typescript'] },
    },
  })
  async getAll() {
    const allTags = await this.tagService.getAll();
    const tags: string[] = allTags.map((tag) => tag.name);
    return { tags };
  }
}
