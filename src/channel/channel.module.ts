import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelSchema } from './schema/channel.schema';
import { UserSchema } from '../user/schema/user.schema';
import { VideoSchema } from '../video/schema/video.schema';
import { UtilsModule } from '../utils/utils.module';
import { PlaylistSchema } from '../playlist/schema/playlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Channel', schema: ChannelSchema },
      { name: 'Video', schema: VideoSchema },
      { name: 'Playlist', schema: PlaylistSchema}
    ]),
    UtilsModule,
  ],
  providers: [ChannelService],
  controllers: [ChannelController],
})
export class ChannelModule {}
