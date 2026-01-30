// src/article/dto/createArticle.dto.ts
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'My First Article' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is a short description' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'This is the full article body' })
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: ['nestjs', 'backend'],
    required: false,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}
