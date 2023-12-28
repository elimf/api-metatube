import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Express } from 'express';

export class CreateShortDto {
  @ApiProperty({ description: 'Title of the video' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the video' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Thumbnail image file',
  })
  @IsOptional()
  @Type(() => Object)
  thumbnailFile: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file',
  })
  @IsOptional()
  @Type(() => Object)
  videoFile: Express.Multer.File;

  thumbnailUrl?: string;

  url?: string;
}
