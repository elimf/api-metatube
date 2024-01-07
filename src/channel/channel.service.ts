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
import { Playlist } from 'src/playlist/schema/playlist.schema';
import { ChannelDTO } from './dto/channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Playlist.name) private readonly playlistModel: Model<Playlist>,
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

  async findById(id: string): Promise<ChannelDTO> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid channel ID');
    }
    const channel = await this.channelModel.findById(id).exec();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    // Get and check the subscribers
    const userIds = channel.subscribers || [];
    const subscribers = await this.getValidUsers(userIds);
    // Get and check the videos
    const videoIds = channel.videos || [];
    const videos = await this.getValidVideos(videoIds);

    // Get and check the playlists
    const playlistIds = channel.playlists || [];
    const playlists = await this.getValidPlaylists(playlistIds);
    // Convert the channel object to a plain object and delete the _id field
    const channelObject = channel.toObject({ virtuals: true });
    delete channelObject._id;
    delete channelObject.__v;
    delete channelObject.id;
    return {
      ...channelObject,
      videos,
      playlists,
      subscribers: subscribers.length,
    };
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
  async updateIcon(userId: string, iconPath: string): Promise<Channel> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.channel) {
      throw new NotFoundException('User has no channel');
    }
    const channel = await this.channelModel
      .findByIdAndUpdate(user.channel, { icon: iconPath }, { new: true })
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
      if (channel.icon) {
        await this.utils.deleteFile(channel.icon);
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

  // Utility functions
  async getValidVideos(videoIds: Video[]): Promise<Video[]> {
    const validVideos = await this.videoModel
      .find({ _id: { $in: videoIds } })
      .select('-__v')
      .exec();
    return validVideos;
  }

  async getValidPlaylists(playlistIds: Playlist[]): Promise<Playlist[]> {
    const validPlaylists = await this.playlistModel
      .find({ _id: { $in: playlistIds } })
      .select('-__v')
      .exec();
    return validPlaylists;
  }

  async getValidUsers(userIds: User[]): Promise<User[]> {
    const validUsers = await this.userModel
      .find({ _id: { $in: userIds } })
      .exec();
    return validUsers;
  }
}
