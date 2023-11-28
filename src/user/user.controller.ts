import {
  Controller,
  Param,
  Patch,
  Delete,
  Body,
  HttpCode,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
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

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id')
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
  updateUser(
    @Param('id') id: string,
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
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(204)
  deleteUser(@Param('id') id: string) {
    // Use the service to delete the user
    return this.userService.deleteOneById(id);
  }
}
