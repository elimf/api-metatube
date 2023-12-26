import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from './schema/channel.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { User } from '../user/schema/user.schema';
import { UpdateChannelDto } from './dto/update-channel.dto';
import Utils from '../utils/utils';
import { Video } from '../video/schema/video.schema';

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    private readonly utils: Utils,
  ) {}

  async create(
    createChannelDto: CreateChannelDto,
    userId: string,
  ): Promise<any> {
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newChannel = new this.channelModel({
      ...createChannelDto,
    });
    // Save the new channel to the database
    newChannel.save();
    // Add the new channel to the user's channel list
    user.channel = newChannel;
    await user.save();
    return {
      status: 201,
      message: `Channel ${newChannel.channelName} created successfully`,
    };
  }
  async findAll(): Promise<Channel[]> {
    const channels = await this.channelModel.find().exec();
    return channels;
  }

  async findById(id: string): Promise<Channel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid channel ID');
    }
    const channel = await this.channelModel.findById(id).exec();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return channel;
  }

  async update(
    userId: string,
    updatedChannel: UpdateChannelDto,
  ): Promise<Channel> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.channel) {
      throw new NotFoundException('User has no channel');
    }

    // Update the document in the channels collection directly
    const channel = await this.channelModel
      .findByIdAndUpdate(user.channel, updatedChannel, { new: true })
      .exec();

    if (!channel) {
      throw new NotFoundException('Channel not found ');
    }

    // Save the modifications to the user document
    user.channel = channel;
    await user.save();

    return channel;
  }
  async updateBanner(userId: string, bannerPath: string): Promise<Channel> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.channel) {
      throw new NotFoundException('User has no channel');
    }
    const channel = await this.channelModel
      .findByIdAndUpdate(user.channel, { banner: bannerPath }, { new: true })
      .exec();

    return channel;
  }
  async deleteOneById(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.channel) {
      const channel = await this.channelModel.findById(user.channel).exec();
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
      if (channel.banner) {
        await this.utils.deleteFile(channel.banner);
      }
      for (const videoId of channel.videos) {
        await this.utils.deleteFile(videoId.thumbnail);
        await this.utils.deleteFile(videoId.url);
        await this.videoModel.findOneAndDelete({ _id: videoId }).exec();
      }

      await this.channelModel.findOneAndDelete({ _id: user.channel }).exec();
      user.channel = null;
      await user.save();
    } else {
      throw new BadRequestException('User has no channel');
    }
  }
}
