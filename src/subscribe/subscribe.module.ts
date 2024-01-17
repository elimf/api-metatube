import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { ChannelSchema } from '../channel/schema/channel.schema';
import {  UserSchema } from 'src/user/schema/user.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Channel', schema: ChannelSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [SubscribeService],
  controllers: [SubscribeController],
})
export class SubscribeModule {}
