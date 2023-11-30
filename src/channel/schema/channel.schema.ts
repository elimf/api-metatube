import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Video } from '../../video/schema/video.schema';
import { Playlist } from '../../playlist/schema/playlist.schema';

@Schema()
export class Channel extends Document {
  @Prop({ required: true })
  channelName: string;

  @Prop()
  description: string;
  
  @Prop({ default: '' })
  banner: string;

  @Prop({ type: [Video] })
  videos: Video[];

  @Prop({ type: [Playlist] })
  playlists: Playlist[];

  @Prop({ required: true, default: Date.now })
  timestamp: string;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
