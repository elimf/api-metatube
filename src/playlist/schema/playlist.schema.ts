/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document  } from 'mongoose';

@Schema()
export class Playlist extends Document {

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String] }) // Assuming the playlist contains a list of videoIds
  videos: string[];

  @Prop({ default: false }) // Playlist privacy flag, default to public
  isPrivate: boolean;

  @Prop({ type: [String], default: [] }) // List of user IDs who can access the private playlist
  allowedUsers: string[];

  @Prop({ required: true, default: Date.now })
  timestamp: string;

}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
