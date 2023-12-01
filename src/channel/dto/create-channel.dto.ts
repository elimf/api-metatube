import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateChannelDto {
  @IsString()
  @ApiProperty({ example: 'MrBeast', description: 'The name of your channel' })
  channelName: string;
}
