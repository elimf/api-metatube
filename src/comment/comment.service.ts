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
    const { videoId, commentId, text } = createCommentDto;

    const video = await this.findVideo(videoId);
    const user = await this.findUser(userId);

    if (commentId) {
      const parentComment = await this.findComment(commentId);
      if (!parentComment) {
        throw new NotFoundException(`Parent comment not found`);
      }
      const createdComment = new this.commentModel({
        text: text,
        userId,
      });
      await createdComment.save();

      // Utilisez l'opération $push pour ajouter l'ID du commentaire créé aux réponses du commentaire parent
      const updateOperation = {
        $push: { replies: createdComment._id },
      };

      // Mettez à jour le commentaire parent avec l'opération $push
      await this.commentModel.findByIdAndUpdate(
        parentComment._id,
        updateOperation,
      );

      return this.createCommentObject(createdComment, userId, user);
    }

    const createdComment = new this.commentModel({
      text: text,
      userId,
    });
    video.comments.push(createdComment._id);
    await video.save();

    return this.createCommentObject(createdComment, userId, user);
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

  // Helper functions
  async findVideo(videoId: string) {
    const video = await this.videoModel.findById(videoId).exec();
    if (!video) {
      throw new NotFoundException(`Video not found`);
    }
    return video;
  }

  async findUser(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findComment(commentId: string) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException(`Comment not found`);
    }
    return comment;
  }

  private createCommentObject(
    comment: Comment,
    userId: string,
    user: User,
  ): CommentDetail {
    return {
      id: comment._id,
      user: {
        id: userId,
        name: user.username,
        avatar: user.avatar,
      },
      replies: [],
      commentText: comment.text,
      timestamp: +comment.timestamp,
    };
  }
}
