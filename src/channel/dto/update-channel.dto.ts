import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateChannelDto {
  @IsString()
  @ApiProperty({ example: 'MrBeast', description: 'The name of your channel' })
  channelName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ default: '', description: 'Description of the channel' })
  description?: string;
}
