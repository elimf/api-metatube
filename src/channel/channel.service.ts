import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from './schema/channel.schema';

@Injectable()
export class ChannelService {
  constructor(@InjectModel('Channel') private readonly channelModel: Model<Channel>) {}

  async create(channel: Channel): Promise<Channel> {
    const newChannel = new this.channelModel(channel);
    return await newChannel.save();
  }

  async findAll(): Promise<Channel[]> {
    return await this.channelModel.find().exec();
  }

  async findById(id: string): Promise<Channel> {
    return await this.channelModel.findById(id).exec();
  }

  async update(id: string, channel: Channel): Promise<Channel> {
    return await this.channelModel.findByIdAndUpdate(id, channel, { new: true }).exec();
  }

  async deleteOneById(id: string): Promise<void> {
    const user = await this.channelModel.findOne({ _id: id }).exec();
    if (!user) {
      // L'utilisateur n'existe pas
      throw new NotFoundException('Utilisateur non trouvé');
    }
    // if (user.avatar) {
    //   await this.deleteFile(user.avatar);
    // }

    // if (user.banner) {
    //   await this.deleteFile(user.banner);
    // }
    await this.channelModel.findOneAndDelete({ _id: id }).exec();
  }
}
