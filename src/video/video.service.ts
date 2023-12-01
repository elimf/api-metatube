import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './schema/video.schema';
import Utils from '../utils/utils';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  constructor(@InjectModel(Video.name) private readonly videoModel: Model<Video>,
  private readonly utils: Utils,
  ) {}

  async uploadVideo(video: CreateVideoDto): Promise<Video> {
    const createdVideo = new this.videoModel(video);
    return createdVideo.save();
  }

  async findAll(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async findById(id: string): Promise<Video> {
    return this.videoModel.findById(id).exec();
  }

  async update(id: string, video: Video): Promise<Video> {
    return this.videoModel.findByIdAndUpdate(id, video, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.videoModel.findOneAndDelete({_id:id}).exec();
  }
}
