/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,  } from 'mongoose';
import * as bcrypt from 'bcrypt';
// Schema as MongooseSchema

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  profile: {
    avatar: string;
    banner: string;
    description: string;
  };

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

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
