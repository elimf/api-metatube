import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comment } from '../../comment/schema/comment.schema';
import { User } from '../../user/schema/user.schema';

@Schema()
export class Short extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likedBy: User[] | [];

  @Prop({ type: [Types.ObjectId], ref: 'Comment', default: [] })
  comments: Comment[];

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, default: Date.now })
  timestamp: string;
}

export const ShortSchema = SchemaFactory.createForClass(Short);
