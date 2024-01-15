import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Video } from '../video/schema/video.schema';
import { User } from '../user/schema/user.schema';
import { CommentDetail } from './dto/comment-detail.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentDetail> {
    const video = await this.videoModel
      .findById(createCommentDto.videoId)
      .exec();
    if (!video) {
      throw new NotFoundException(`Video not found`);
    }
    const user = await this.userModel.findById(userId).exec();
    const createdComment = new this.commentModel({
      text: createCommentDto.text,
      userId,
    });
    video.comments.push(createdComment._id);
    await video.save();
    const savedComment = await createdComment.save();
    const commentObject: CommentDetail = {
      id: savedComment._id,
      user: {
        id: userId,
        name: user.username,
        avatar: user.avatar,
      },
      replies: [],
      commentText: savedComment.text,
      timestamp: +savedComment.timestamp,
    };

    return commentObject;
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const updatedComment = await this.commentModel
      .findOneAndUpdate({ _id: id, userId }, updateCommentDto, { new: true })
      .exec();
    if (!updatedComment) {
      throw new NotFoundException(`Comment  not found`);
    }
    return updatedComment;
  }

  async deleteComment(userId: string, id: string): Promise<void> {
    await this.videoModel.updateOne(
      { comments: { $in: [id] } },
      { $pull: { comments: id } },
    );
    await this.commentModel.deleteOne({ _id: id, userId }).exec();
  }
}
