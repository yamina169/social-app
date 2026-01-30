// src/article/dto/updateArticle.dto.ts
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Updated body content' })
  @IsOptional()
  @IsString()
  body: string;
}
