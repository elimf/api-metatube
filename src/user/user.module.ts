import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserSchema } from './schema/user.schema';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    UtilsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
