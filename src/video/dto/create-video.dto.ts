import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ description: 'Title of the video' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the video' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'URL of the video thumbnail' })
  @IsNotEmpty()
  @IsUrl()
  thumbnail: string;

  @ApiProperty({ description: 'URL of the video' })
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
