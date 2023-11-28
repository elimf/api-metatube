/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import { User, UserRole } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
  ) {}
  async createUser(user: CreateUserDto): Promise<User> {
    // Check if the email is already in use
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new BadRequestException(
        'This email is already in use by another user.',
      );
    }
    // Check if the username is already in use
    const existingUsernameUser = await this.userModel
      .findOne({ username: user.username })
      .exec();
    if (existingUsernameUser) {
      throw new BadRequestException(
        'This username is already in use by another user.',
      );
    }

    // If the email is not already in use, continue with user creation
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const createdUser = new this.userModel({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: UserRole.USER,
        avatar: '',
        banner: '',
        description: '',
        subscriptions: [],
        videos: [],
        playlists: [],
        history: [],
        likedVideos: [],
      });

      return createdUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating the user.');
    }
  }

  async findOneById(id: ObjectId): Promise<User | null> {
    return this.userModel.findById(id);
  }
  async findOneWithEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email: email });
  }
  async deleteOneById(id: string): Promise<void> {
    await this.userModel.findOneAndDelete({ _id: id }).exec();
  }
  async updateUser(
    id: string,
    updateUserDto: any,
  ): Promise<User> {
    

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }
}
