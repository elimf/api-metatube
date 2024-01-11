import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comment } from '../../comment/schema/comment.schema';
import { Like } from '../../like/schema/like.schema';

@Schema()
export class Video extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [Types.ObjectId], ref: 'Like', default: [] })
  likedBy: Like[] | [];

  @Prop({ type: [Types.ObjectId], ref: 'Comment', default: [] })
  comments: Comment[];

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, default: Date.now })
  timestamp: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
