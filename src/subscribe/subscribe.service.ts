import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from '../channel/schema/channel.schema';
import { User } from '../user/schema/user.schema';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findSubscribe(userId: string, channelId: string) {
    const user = await this.userModel.findById(userId);
   const channel = await this.channelModel
     .findOne({ _id: channelId, subscribers: user._id })
     .exec();

    return !!channel;
  }
  
  async removeSubscribe(userId: string, channelId: string) {
    const channel = await this.channelModel.findById(channelId);
    const user = await this.userModel.findById(userId);

    if (!channel || !user) {
      throw new NotFoundException('Channel or user not found.');
    }

     if (user.subscriptions.find((sub) => sub === channel._id)) {
       throw new ConflictException(
         'You are already subscribed to this channel.',
       );
     }

    const updatedChannel = await this.channelModel.findByIdAndUpdate(
      channel._id,
      { $pull: { subscribers: user._id } },
      { new: true },
    );

    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { subscriptions: channel._id } },
      { new: true },
    );

    return updatedChannel;
  }

  async addSubscribe(userId: string, channelId: string) {
    const channel = await this.channelModel.findById(channelId);
    const user = await this.userModel.findById(userId);

    if (!channel || !user) {
      throw new NotFoundException('Channel or user not found.');
    }

    
    if (user.subscriptions.find((sub) => sub=== channel._id)) {
      throw new ConflictException(
        'You are already subscribed to this channel.',
      );
    }


    const updatedChannel = await this.channelModel.findByIdAndUpdate(
      channel._id,
      { $addToSet: { subscribers: user._id } },
      { new: true },
    );

    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { subscriptions: channel._id } },
      { new: true },
    );

    return updatedChannel;
  }
}
