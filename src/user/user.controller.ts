import {
  Controller,
   Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
@Get()
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Request() req) {
     const userId = req.user.id;
   // Call the method from the user service to get user information
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }], {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Request() req,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[] },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (files.avatar) {
      updateUserDto.avatar = files.avatar[0].path;
    }
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete your personnal account' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteUser(@Request() req) {
    return this.userService.deleteOneById(req.user.id);
  }
}
