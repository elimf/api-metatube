import {
  Controller,
  Patch,
  Delete,
  Body,
  HttpCode,
  Request,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
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

  @Patch()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Request() req,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[]; banner?: Express.Multer.File[] },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (files.avatar) {
      updateUserDto.avatar = files.avatar[0].path;
    }
    if (files.banner) {
      updateUserDto.banner = files.banner[0].path;
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
