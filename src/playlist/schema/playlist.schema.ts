import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document  } from 'mongoose';

@Schema()
export class Playlist extends Document {

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String] }) 
  videos: string[];

  @Prop({ default: false }) 
  isPrivate: boolean;

  @Prop({ type: [String], default: [] }) 
  allowedUsers: string[];

  @Prop({ required: true, default: Date.now })
  timestamp: string;

}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
