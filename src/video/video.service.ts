/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { VideoDetail } from './dto/get-videoDetail.dto';
import { AllVideo } from './dto/get-all-video';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    private readonly utils: Utils,
  ) {}

  async findAll(): Promise<AllVideo[]> {
    const videos = await this.videoModel.find().exec();
    const sortedVideos = this.metaSortVideo(videos);

    const videosWithAssociatedChannel: AllVideo[] = [];

    for (const video of sortedVideos) {
      const channel = await this.channelModel
        .findOne({ videos: video._id })
        .exec();

      if (channel) {
        const videoDetail: AllVideo = {
          _id: video._id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          views: video.views,
          url: video.url,
          timestamp: video.timestamp,
          channel: {
            _id: channel._id,
            channelName: channel.channelName,
            icon: channel.icon,
            subscribers: channel.subscribers.length,
          },
        };

        videosWithAssociatedChannel.push(videoDetail);
      }
    }

    return videosWithAssociatedChannel;
  }

  private metaSortVideo(videos: Video[]): Video[] {
    // Custom sorting algorithm based on popularity and timestamp
    return videos.sort((a, b) => {
      const popularityA = a.views + a.likedBy.length + a.comments.length;
      const popularityB = b.views + b.likedBy.length + b.comments.length;

      // Convert timestamp strings to Date objects for comparison
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();

      // Sort by popularity in descending order
      if (popularityA !== popularityB) {
        return popularityB - popularityA;
      }

      // If popularity is the same, sort by timestamp in descending order
      return timestampB - timestampA;
    });
  }

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

  async findById(id: string): Promise<VideoDetail> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Video ID');
    }

    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Find the channel of the video
    const channel = await this.channelModel
      .findOne({ videos: new Types.ObjectId(id) })
      .exec();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Get suggested videos from the same channel
    const suggestedVideosFromSameChannel = await this.videoModel
      .find({ _id: { $ne: new Types.ObjectId(id) }, channel: channel._id })
      .limit(3) // Limit the number of suggestions from the same channel to 3, adjust as needed
      .exec();

    // Get suggested videos from other channels
    const suggestedVideosFromOtherChannels = await this.videoModel
      .find({ _id: { $ne: new Types.ObjectId(id) } })
      .limit(3) // Limit the number of suggestions from other channels to 3, adjust as needed
      .exec();

    // Fetch details for each suggested video's channel (only for videos from other channels)
    const suggestedVideosWithChannelDetails = await Promise.all(
      suggestedVideosFromOtherChannels.map(async (suggestedVideo) => {
        const suggestedVideoChannel = await this.channelModel
          .findOne({ videos: suggestedVideo._id })
          .exec();

        return {
          _id: suggestedVideo._id,
          title: suggestedVideo.title,
          thumbnail: suggestedVideo.thumbnail,
          views: suggestedVideo.views,
          timestamp: suggestedVideo.timestamp,
          url: suggestedVideo.url,
          channel: suggestedVideoChannel
            ? {
                _id: suggestedVideoChannel._id,
                channelName: suggestedVideoChannel.channelName,
                icon: suggestedVideoChannel.icon,
                subscribers: suggestedVideoChannel.subscribers.length,
              }
            : null,
        };
      }),
    );

    const videoDetail: VideoDetail = {
      _id: video._id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      views: video.views,
      url: video.url,
      timestamp: video.timestamp,
      likedBy: [],
      comments: [],
      channel: {
        _id: channel._id,
        channelName: channel.channelName,
        icon: channel.icon,
        subscribers: channel.subscribers.length,
      },
      suggestions: [
        ...suggestedVideosFromSameChannel.map((suggestedVideo) => ({
          _id: suggestedVideo._id,
          title: suggestedVideo.title,
          thumbnail: suggestedVideo.thumbnail,
          views: suggestedVideo.views,
          timestamp: suggestedVideo.timestamp,
          url: suggestedVideo.url,
          channel: {
            _id: channel._id,
            channelName: channel.channelName,
            icon: channel.icon,
            subscribers: channel.subscribers.length,
          },
        })),
        ...suggestedVideosWithChannelDetails,
      ],
    };

    return videoDetail;
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
      await this.videoModel.deleteOne({ _id: videoId }).exec();
      await channel.save();
    } else {
      throw new BadRequestException('User has no channel');
    }
  }
}
