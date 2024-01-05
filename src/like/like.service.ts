// like.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikedEntityType } from './schema/like.schema';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
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
    return newLike.save();
  }

  async removeLike(
    userId: string,
    entityId: string,
    entityType: LikedEntityType,
  ): Promise<void> {
    const deleted = await this.likeModel
      .findOneAndDelete({ userId, entityId, entityType })
      .exec();

    if (!deleted) {
      throw new NotFoundException('Like not found');
    }
  }
}
