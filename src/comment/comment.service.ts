import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Video } from '../video/schema/video.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const video = await this.videoModel
      .findById(createCommentDto.videoId)
      .exec();
    if (!video) {
      throw new NotFoundException(`Video not found`);
    }

    const createdComment = new this.commentModel({
      text: createCommentDto.text,
      userId,
    });
    video.comments.push(createdComment._id);
    await video.save();
    const savedComment = await createdComment.save();
    return savedComment.toJSON({ versionKey: false, virtuals: false });
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
