import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../user/schema/user.schema';


@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login path' })
  @ApiResponse({
    status: 201,
    description: 'Get a token.',
  })
  async login(@Request() req) {
    return await this.authService.login(req.user._doc);
  }

  @Post('register')
  @ApiOperation({ summary: 'Post to create a User' })
  @ApiResponse({
    status: 201,
    description: 'Informations about the user.',
    type: User,
  })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Route to refresh the token.' })
  @ApiResponse({
    status: 200,
    description: 'Get your new token.',
    type: 'token',
  })
  async refrshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}