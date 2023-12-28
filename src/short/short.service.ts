import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Short} from './schema/short.schema';
import Utils from '../utils/utils';
import { CreateShortDto } from './dto/create-short.dto';
import { User } from '../user/schema/user.schema';
import { Channel } from '../channel/schema/channel.schema';

@Injectable()
export class ShortService {
  constructor(
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Short.name) private readonly shortModel: Model<Short>,
    private readonly utils: Utils,
  ) {}

  async uploadShort(
    createShortDto: CreateShortDto,
    userId: string,
  ): Promise<Short> {
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.channel === null) {
      throw new NotFoundException('User has no channel');
    }
    // Get the channel of the user
    const channel = await this.channelModel.findById(user.channel).exec();
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Create a new video
    const newShort = new this.shortModel({
      comments: [],
      description: createShortDto.description,
      thumbnail: createShortDto.thumbnailUrl,
      likedBy: [],
      timestamp: Date.now(),
      title: createShortDto.title,
      url: createShortDto.url,
      views: 0,
    });
    // Save the new short to the database
    await newShort.save();
    channel.shorts.push(newShort._id);
    await channel.save();
    return newShort;
  }

  async findById(id: string): Promise<Short> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Short ID');
    }
    const video = await this.shortModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Short not found');
    }
    return video;
  }

  async update(id: string, video: Short): Promise<Short> {
    return this.shortModel.findByIdAndUpdate(id, video, { new: true }).exec();
  }

  async deleteOneById(userId: string, videoId: string): Promise<void> {
    const video = await this.shortModel.findById(videoId).exec();
    if (!video) {
      throw new NotFoundException('Short not found');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.channel) {
      const channel = await this.channelModel.findById(user.channel).exec();
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
      const index = channel.videos.indexOf(video._id);
      if (index > -1) {
        channel.videos.splice(index, 1);
      } else {
        throw new NotFoundException('Short not found in channel');
      }

      await this.utils.deleteFile(video.thumbnail);
      await this.utils.deleteFile(video.url);
      await this.shortModel.deleteOne({ _id: videoId }).exec();
      await channel.save();
    } else {
      throw new BadRequestException('User has no channel');
    }
  }
}
