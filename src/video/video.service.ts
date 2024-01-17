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
import { CommentVideoDetail, VideoDetail } from './dto/get-videoDetail.dto';
import { AllVideo } from './dto/get-all-video';
import { Like } from '../like/schema/like.schema';
import { Comment } from '../comment/schema/comment.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
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

  async findById(id: string, userId?: string): Promise<VideoDetail> {
    const user = await this.userModel.findById(userId).exec();
    const video = await this.findVideo(id);
    const channel = await this.findChannel(id);
    const suggestedVideosFromSameChannel =
      await this.findSuggestedVideosFromSameChannel(id);
    const suggestedVideosFromOtherChannels =
      await this.findSuggestedVideosFromOtherChannels(id);
    const suggestedVideosWithChannelDetails =
      await this.findSuggestedVideosWithChannelDetails(
        suggestedVideosFromOtherChannels,
      );
    const userLikedVideo = userId
      ? await this.findUserLikedVideo(userId, id)
      : false;
    const userSubscribedChannel = userId
      ? await this.findUserSubscribe(user._id, channel._id)
      : false;

    const videoDetail: VideoDetail = {
      _id: video._id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      views: video.views,
      url: video.url,
      timestamp: video.timestamp,
      likedBy: video.likedBy,
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
      liked: userLikedVideo,
      subscribed: userSubscribedChannel,
    };

    const commentsForVideo = await this.findCommentsForVideo(video);

    videoDetail.comments = await Promise.all(
      commentsForVideo.map(async (comment) => {
        const userDetails = await this.findUserDetails(comment);
        const replies = await this.findRepliesForComment(comment);

        // Utilisez Promise.all pour attendre la résolution de toutes les promesses dans le tableau
        const resolvedReplies = await Promise.all(
          replies.map(async (reply) => ({
            id: reply._id,
            user: await this.findUserDetails(reply),
            commentText: reply.text,
            timestamp: +reply.timestamp,
          })),
        );

        return {
          id: comment._id,
          user: userDetails,
          replies: resolvedReplies,
          commentText: comment.text,
          timestamp: +comment.timestamp,
        };
      }),
    );

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

  // Helper functions
  async findVideo(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Video ID');
    }

    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
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
  async findChannel(id: string) {
    const channel = await this.channelModel
      .findOne({ videos: new Types.ObjectId(id) })
      .exec();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return channel;
  }

  async findSuggestedVideosFromSameChannel(id: string) {
    return this.videoModel
      .find({ _id: { $ne: new Types.ObjectId(id) }, channel: id })
      .limit(3)
      .exec();
  }

  async findSuggestedVideosFromOtherChannels(id: string) {
    return this.videoModel
      .find({ _id: { $ne: new Types.ObjectId(id) } })
      .limit(3)
      .exec();
  }

  async findSuggestedVideosWithChannelDetails(suggestedVideos) {
    return Promise.all(
      suggestedVideos.map(async (suggestedVideo) => {
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
  }

  async findUserLikedVideo(userId, videoId) {
    const likeEntry = await this.likeModel
      .findOne({ userId, entityId: videoId })
      .exec();

    return !!likeEntry;
  }

    async findUserSubscribe(userId, channelId) {
  const channel = await this.channelModel
    .findOne({ _id: channelId, subscribers: userId })
    .exec();

  return !!channel;
}

  async findCommentsForVideo(video) {
    return this.commentModel.find({ _id: { $in: video.comments } }).exec();
  }

  async findUserDetails(comment) {
    const user = await this.userModel.findById(comment.userId).exec();
    return {
      id: user._id,
      name: user.username,
      avatar: user.avatar,
    };
  }
  async findRepliesForComment(comment: any) {
    const replies = await this.commentModel
      .find({ _id: { $in: comment.replies } })
      .exec();
    return replies;
  }
}
