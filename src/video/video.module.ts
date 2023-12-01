import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoSchema } from './schema/video.schema';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
  MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
  UtilsModule ],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
