import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import Utils from '../utils/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly utils: Utils,
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
        avatar: '',
        channel: '',
        subscriptions: [],
        playlists: [],
        history: [],
        likedVideos: [],
        role: UserRole.USER,
        timestamp: Date.now(),
      });

      return createdUser.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating the user.');
    }
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.userModel
      .findById(id)
      .select(
        '-_id username avatar channel subscriptions playlists history likedVideos timestamp',
      )
      .exec();

    return user || null;
  }

  async findOneWithEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email: email });
  }

  async updateUser(id: string, updateUserDto: any): Promise<User> {
    let user: User | null = null;
    // Check if the user exists
    try {
      user = await this.userModel.findOne({ _id: id }).exec();
    } catch (error) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar or banner files if they are present in updateUserDto
    if (updateUserDto.avatar) {
      await this.utils.deleteFile(user.avatar);
    }

    // Update the user with the new information
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    return updatedUser;
  }

  async deleteOneById(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user) {
      //
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (user.avatar) {
      await this.utils.deleteFile(user.avatar);
    }

    await this.userModel.findOneAndDelete({ _id: userId }).exec();
  }
}
