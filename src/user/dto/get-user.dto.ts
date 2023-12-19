import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  username: string;

  @IsString()
  @ApiProperty({ example: '/uploads/avatar.jpg', description: 'The avatar path of the user' })
  avatar: string;

  @IsString()

  constructor(username: string, avatar: string) {
    this.username = username;
    this.avatar = avatar;
  }
}
