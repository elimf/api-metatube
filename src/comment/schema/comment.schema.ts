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
    
    @Prop({ type: () => [Comment], default: [] }) // Lazy load the type
    replies: Comment[];
    
    @Prop({ required: true })
    timestamp: string;

}

export const CommentSchema = SchemaFactory.createForClass(Comment);
