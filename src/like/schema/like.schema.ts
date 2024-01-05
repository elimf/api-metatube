// like.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum LikedEntityType {
  COMMENT = 'Comment',
  VIDEO = 'Video',
  SHORT = 'Short',
}

@Schema()
export class Like extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  entityId: string;

  @Prop({ required: true, enum: Object.values(LikedEntityType) })
  entityType: string;

  @Prop({ required: true, default: Date.now })
  timestamp: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
