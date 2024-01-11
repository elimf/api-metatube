import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import {  LikeSchema } from './schema/like.schema';
import { VideoSchema } from '../video/schema/video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Like', schema: LikeSchema },
      { name: 'Video', schema: VideoSchema },
    ]),
  ],
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
