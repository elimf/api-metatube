import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './schema/video.schema';
import Utils from '../utils/utils';
import { CreateVideoDto } from './dto/create-video.dto';
import { User } from '../user/schema/user.schema';
import { Channel } from '../channel/schema/channel.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    private readonly utils: Utils,
  ) {}

  async uploadVideo(
    createVideoDto: CreateVideoDto,
    userId: string,
  ): Promise<Video> {
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
    const newVideo = new this.videoModel({
      comments: [],
      description: createVideoDto.description,
      thumbnail: createVideoDto.thumbnailUrl,
      likedBy: [],
      timestamp: Date.now(),
      title: createVideoDto.title,
      url: createVideoDto.videoUrl,
      views: 0,
    });
    // Save the new video to the database
    await newVideo.save();
    channel.videos.push(newVideo._id);
    await channel.save();
    return newVideo;
  }

  async findById(id: string): Promise<Video> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Video ID');
    }
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async update(id: string, video: Video): Promise<Video> {
    return this.videoModel.findByIdAndUpdate(id, video, { new: true }).exec();
  }

  async deleteOneById(userId: string, videoId: string): Promise<void> {
    const video = await this.videoModel.findById(videoId).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
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
        throw new NotFoundException('Video not found in channel');
      }

      await this.utils.deleteFile(video.thumbnail);
      await this.utils.deleteFile(video.url);
      await this.videoModel.deleteOne({_id:videoId}).exec();
      await channel.save();
    } else {
      throw new BadRequestException('User has no channel');
    }
  }
}
