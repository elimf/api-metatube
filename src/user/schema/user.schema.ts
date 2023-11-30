import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Channel } from '../../channel/schema/channel.schema';
import { Playlist } from '../../playlist/schema/playlist.schema';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
  }
@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar: string;

  @Prop({ type: Types.ObjectId, ref: 'Channel' })
  channel: Channel;

  @Prop({ type: [{ channelId: String, channelName: String }] })
  subscriptions: Array<{ channelId: string; channelName: string }>;

  @Prop({ type: [Playlist] })
  playlists: Playlist[];

  @Prop({ type: [{ videoId: String, title: String, timestamp: String }] })
  history: Array<{ videoId: string; title: string; timestamp: string }>;

  @Prop({ type: [String] })
  likedVideos: string[];

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

  @Prop({ required: true, default: Date.now })
  timestamp: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
