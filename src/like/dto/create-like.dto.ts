import { ApiProperty } from '@nestjs/swagger';
import { LikedEntityType } from '../schema/like.schema';
import {  IsString } from 'class-validator';
export class CreateLikeDto {
  @IsString()
  @ApiProperty()
  entityType: LikedEntityType;

  @IsString()
  @ApiProperty()
  entityId: string;
}
