import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneWithEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      id: user._id,
    };
    return {
      access_token: await this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
      refresh_token: await this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      }),
    };
  }
  async refreshToken(user: User) {
        const payload = {
      id: user.id,
    };
    return {
      access_token: await this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
      refresh_token: await this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '60',
      }),
    };
  }
}
