import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Video } from '../../video/schema/video.schema';
import { Playlist } from '../../playlist/schema/playlist.schema';
import { User } from '../../user/schema/user.schema';
import { Short } from '../../short/schema/short.schema';

@Schema()
export class Channel extends Document {
  @Prop({ default: '' })
  banner: string;

  @Prop({ required: true })
  channelName: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Playlist', default: [] })
  playlists: Playlist[];

  @Prop({ required: true, default: Date.now })
  timestamp: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: [] })
  subscribers: User[];

  @Prop({ type: Types.ObjectId, ref: 'Short', default: [] })
  shorts: Short[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Video' }], default: [] })
  videos: Video[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
