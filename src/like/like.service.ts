import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikedEntityType } from './schema/like.schema';
import { Video } from '../video/schema/video.schema';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
  ) {}

  async findLike(
    userId: string,
    entityId: string,
    entityType: LikedEntityType,
  ): Promise<Like | null> {
    return this.likeModel.findOne({ userId, entityId, entityType }).exec();
  }

  async addLike(
    userId: string,
    entityId: string,
    entityType: LikedEntityType,
  ): Promise<Like> {
    const newLike = new this.likeModel({ userId, entityId, entityType });
    await newLike.save();

    switch (entityType) {
      case LikedEntityType.VIDEO:
        return this.addLikeToVideo(userId, entityId, newLike);
      default:
    }
  }
  async addLikeToVideo(
    userId: string,
    entityId: string,
    newLike: Like,
  ): Promise<Like> {
    const updateQuery = { _id: entityId };
    const updateOperation = {
      $push: { likedBy: newLike._id },
    };

    const updatedVideo = await this.videoModel
      .findOneAndUpdate(updateQuery, updateOperation, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return newLike;
  }

  async removeLike(
    userId: string,
    entityId: string,
    entityType: LikedEntityType,
    likeId: string,
  ): Promise<void> {
    switch (entityType) {
      case LikedEntityType.VIDEO:
        return this.removeLikeFromVideo(userId, entityId, likeId);
      default:
    }
  }
  async removeLikeFromVideo(
    userId: string,
    entityId: string,
    likeId: string,
  ): Promise<void> {
    // Retirer l'ID du like de la propriété likedBy de la vidéo
    const updateQuery = { _id: entityId };
    const updateOperation = {
      $pull: { likedBy: likeId }, // Utiliser likeId pour retirer le like spécifique
    };

    // Update the video likedBy property
    const updatedVideo = await this.videoModel
      .findOneAndUpdate(updateQuery, updateOperation, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    // Delete the like document
    const deleted = await this.likeModel
      .findOneAndDelete({ _id: likeId, userId, entityId }) // Assurez-vous d'utiliser _id pour likeId
      .exec();

    if (!deleted) {
      throw new NotFoundException('Like not found');
    }
  }
}
