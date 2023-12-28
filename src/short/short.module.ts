import { Module } from '@nestjs/common';
import { ShortService } from './short.service';
import { ShortController } from './short.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortSchema } from './schema/short.schema';
import { UtilsModule } from '../utils/utils.module';
import { UserSchema } from '../user/schema/user.schema';
import { ChannelSchema } from '../channel/schema/channel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Short', schema: ShortSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Channel', schema: ChannelSchema },
    ]),
    UtilsModule,
  ],
  providers: [ShortService],
  controllers: [ShortController],
})
export class ShortModule {}
