import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty()
  text?: string;

  @ApiProperty({ type: [String] })
  likedBy?: string[];

  @ApiProperty({ type: () => [UpdateCommentDto] })
  replies?: UpdateCommentDto[];
}
