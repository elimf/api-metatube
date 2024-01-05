import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schema/comment.schema';
import { VideoSchema } from '../video/schema/video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema },
      { name: 'Video', schema: VideoSchema },
    ]),
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
