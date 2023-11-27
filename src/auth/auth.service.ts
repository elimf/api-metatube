import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schema/user.schema';
//import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).exec();

    if (user && (await user.validatePassword(password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
