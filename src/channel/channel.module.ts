import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelSchema } from './schema/channel.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Channel', schema: ChannelSchema }])],
  providers: [ChannelService],
  controllers: [ChannelController]
})
export class ChannelModule {}
