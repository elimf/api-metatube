/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document  } from 'mongoose';

@Schema()
export class Comment extends Document {
  
    @Prop({ required: true })
    text: string;

    @Prop({ type: [String], default: [] })
    likedBy: string[];
  
    @Prop({ type: [String], default: [] })
    dislikedBy: string[];

    @Prop({ required: true })
    userId: string;
    
    @Prop({ type: [{ type: [Comment], ref: 'Comment' }], default: [] })
    replies: Comment[];
    
    @Prop({ required: true })
    timestamp: string;

}

export const CommentSchema = SchemaFactory.createForClass(Comment);
