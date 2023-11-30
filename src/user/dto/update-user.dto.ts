// update-user.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'The name of your user' })
  username?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'johndoe@example45.com',
    description: 'The email of your user',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'password',
    description: 'The password of your user',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'avatar-url',
    description: 'The URL of the avatar image',
  })
  avatar?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: [{ channelId: 'channelId1', channelName: 'channelName1' }],
    description: 'Array of subscriptions',
  })
  subscriptions?: Array<{ channelId: string; channelName: string }>;

  // Ajoutez d'autres champs que vous souhaitez rendre modifiables
}
