import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @ApiProperty({ required: true })
  text: string;

  @IsString()
  @ApiProperty({ required: true })
  videoId: string;
}
