import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Express } from 'express';

export class BannerUpdateDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Banner image file',
  })
  @IsNotEmpty()
  @Type(() => Object)
  banner: Express.Multer.File;
}
