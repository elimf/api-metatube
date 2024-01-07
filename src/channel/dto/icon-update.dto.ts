import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Express } from 'express';

export class IconUpdateDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Icon image file',
  })
  @IsNotEmpty()
  @Type(() => Object)
  icon: Express.Multer.File;
}
