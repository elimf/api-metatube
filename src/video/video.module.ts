import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoSchema } from './schema/video.schema';
import { UtilsModule } from '../utils/utils.module';
import { UserSchema } from '../user/schema/user.schema';
import { ChannelSchema } from '../channel/schema/channel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Video', schema: VideoSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Channel', schema: ChannelSchema },
    ]),
    UtilsModule,
  ],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
