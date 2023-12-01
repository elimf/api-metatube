import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document  } from 'mongoose';
import { Comment } from '../../comment/schema/comment.schema';

@Schema()
export class Video extends Document {
  
    @Prop({ required: true })
    title: string;
  
    @Prop({ required: true })
    description: string;
  
    @Prop({ required: true })
    thumbnail: string;
  
    @Prop({ required: true })
    views: number;
  
    @Prop({ type: [String], default: [] })
    likedBy: string[];
  
    @Prop({ type: [String], default: [] })
    dislikedBy: string[];
  
    @Prop({ type: [Comment] })
    comments: Comment[];
  
    @Prop({ required: true, default: Date.now })
    timestamp: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
