import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content/body of the comment',
    example: 'This is a comment body.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}
