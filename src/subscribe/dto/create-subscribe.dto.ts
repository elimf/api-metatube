import { ApiProperty } from '@nestjs/swagger';
import {  IsString } from 'class-validator';
export class CreateSubscribeDto {
  @IsString()
  @ApiProperty()
  channelId: string;
}
