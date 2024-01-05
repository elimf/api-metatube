import { ApiProperty } from '@nestjs/swagger';
import { LikedEntityType } from '../schema/like.schema';

export class CreateLikeDto {

  @ApiProperty()
  entityType: LikedEntityType;

  @ApiProperty()
  entityId: string;
}
