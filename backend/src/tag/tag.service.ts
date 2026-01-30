import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  // Get all tags
  async getAll(): Promise<TagEntity[]> {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  // Create a tag if it doesn't exist
  async createTag(name: string): Promise<TagEntity> {
    if (!name || name.trim() === '') {
      throw new BadRequestException('Tag name cannot be empty');
    }

    const cleanName = name.trim().toLowerCase();

    const existing = await this.tagRepository.findOne({
      where: { name: cleanName },
    });
    if (existing) return existing;

    const tag = this.tagRepository.create({ name: cleanName });
    return this.tagRepository.save(tag);
  }

  // Optional: create multiple tags at once
  async createTags(names: string[]): Promise<TagEntity[]> {
    const tags: TagEntity[] = [];
    for (const name of names) {
      const tag = await this.createTag(name);
      tags.push(tag);
    }
    return tags;
  }
}
