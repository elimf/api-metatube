import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @ApiProperty({ required: true })
  text: string;

  @IsString()
  @ApiProperty({ required: true })
  videoId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  commentId?: string;
}
