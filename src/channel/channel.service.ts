import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Channel } from './schema/channel.schema';
import { CreateChannelDto } from './dto/create-channel.dto';
import { User } from '../user/schema/user.schema';

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Channel.name) private readonly channelModel: Model<Channel>,
  ) {}

  async create(
    createChannelDto: CreateChannelDto,
    userId: string,
  ): Promise<Channel> {
    // Check if the user exists
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    // Create a new Channel  using the DTO
    const newChannel = new this.channelModel({
      ...createChannelDto,
    });
    // Save the new channel to the database
    newChannel.save();
    // Add the new channel to the user's channel list
    user.channel = newChannel;
    await user.save();

    return newChannel;
  }
  async findAll(): Promise<Channel[]> {
    const channels = await this.channelModel.find().exec();
    return channels;
  }

  async findById(id: string): Promise<Channel> {
    const channel = await this.channelModel.findById(id).exec();

    if (!channel) {
      throw new NotFoundException('Chaîne non trouvée');
    }

    return channel;
  }

  async update(
    userId: string,
    channelId: string,
    updatedChannel: Channel,
  ): Promise<Channel> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.channel && user.channel._id.toString() === channelId) {
      // Mettre à jour les propriétés de la chaîne avec les nouvelles valeurs
      Object.assign(user.channel, updatedChannel);

      // Sauvegarder les modifications dans le document utilisateur
      await user.save();

      return user.channel;
    } else {
      throw new NotFoundException('Chaîne non trouvée dans cet utilisateur');
    }
  }
  async deleteOneById(userId: string, channelId: string): Promise<void> {
    // Trouver le document utilisateur par ID
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.channel && user.channel._id.toString() === channelId) {
      // Supprimer la référence à la chaîne dans le champ 'channel'
      user.channel = undefined;

      // Sauvegarder les modifications dans le document utilisateur
      await user.save();
    } else {
      throw new NotFoundException("Channel not found in user's channels");
    }
  }
}
