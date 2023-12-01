import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'John Doe ', description: 'The name of your user' })
  username: string;

  @IsEmail()
  @ApiProperty({
    example: 'johndoe@example45.com ',
    description: 'The email of your user',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'password ',
    description: 'The password of your user',
  })
  password: string;
}
