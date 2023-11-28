/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,  } from 'mongoose';

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

  @Prop()
  banner: string;

  @Prop()
  description: string;

  @Prop({ type: [{ channelId: String, channelName: String }] })
  subscriptions: Array<{ channelId: string; channelName: string }>;

  @Prop({ type: [{ videoId: String, title: String, description: String, thumbnail: String, views: Number, likes: Number, dislikes: Number, comments: [{ commentId: String, text: String, userId: String, timestamp: String }] }] })
  videos: Array<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    views: number;
    likes: number;
    dislikes: number;
    comments: Array<{ commentId: string; text: string; userId: string; timestamp: string }>;
  }>;

  @Prop({ type: [{ playlistId: String, title: String, videos: [String] }] })
  playlists: Array<{ playlistId: string; title: string; videos: string[] }>;

  @Prop({ type: [{ videoId: String, title: String, timestamp: String }] })
  history: Array<{ videoId: string; title: string; timestamp: string }>;

  @Prop({ type: [String] })
  likedVideos: string[];
  
  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

}

export const UserSchema = SchemaFactory.createForClass(User);
