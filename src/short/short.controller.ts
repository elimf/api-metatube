import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShortService } from './short.service';
import { Short } from './schema/short.schema';
import { CreateShortDto } from './dto/create-short.dto';
import Utils from '../utils/utils';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as mime from 'mime-types';

@ApiTags('Short')
@Controller('short')
export class ShortController {
  constructor(
    private readonly shortService: ShortService,
    private readonly utils: Utils,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Find a short by ID' })
  @ApiResponse({
    status: 200,
    description: 'The short has been found.',
    type: Short,
  })
  async findById(@Param('id') id: string): Promise<Short> {
    return this.shortService.findById(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new short' })
  @ApiResponse({
    status: 201,
    description: 'The short has been successfully created.',
    type: Short,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'shortFile', maxCount: 1 },
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
  async create(
    @Request() req,
    @Body() createShortDto: CreateShortDto,
    @UploadedFiles()
    files: {
      thumbnailFile: Express.Multer.File[];
      shortFile: Express.Multer.File[];
    },
  ): Promise<Short> {
    const userId = req.user.id;
    const deleteUndesiredFiles = async () => {
      if (files.thumbnailFile) {
        await this.utils.deleteFile(files.thumbnailFile[0].path);
      }
      if (files.shortFile) {
        await this.utils.deleteFile(files.shortFile[0].path);
      }
    };

    if (
      !files.thumbnailFile ||
      files.thumbnailFile.length === 0 ||
      !files.shortFile ||
      files.shortFile.length === 0
    ) {
      await deleteUndesiredFiles();
      throw new BadRequestException(
        'You must provide a thumbnail and a short file.',
      );
    }

    if (files.thumbnailFile && files.thumbnailFile.length > 0) {
      const thumbnailMime = mime.lookup(files.thumbnailFile[0].path);

      if (thumbnailMime !== 'image/jpeg' && thumbnailMime !== 'image/png') {
        await deleteUndesiredFiles();
        throw new BadRequestException(
          "This file type isn't allowed for the thumbnail.",
        );
      }

      createShortDto.thumbnailUrl = files.thumbnailFile[0].path;
    }

    if (files.shortFile && files.shortFile.length > 0) {
      const shortMime = mime.lookup(files.shortFile[0].path);

      if (shortMime !== 'short/mp4' && shortMime !== 'short/quicktime') {
        await deleteUndesiredFiles();
        throw new BadRequestException(
          "This file type isn't allowed for the short.",
        );
      }

      createShortDto.url = files.shortFile[0].path;
    }
    return this.shortService.uploadShort(createShortDto, userId);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update a short by ID' })
  @ApiResponse({
    status: 200,
    description: 'The short has been successfully updated.',
    type: Short,
  })
  async update(@Param('id') id: string, @Body() short: Short): Promise<Short> {
    return this.shortService.update(id, short);
  }
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a short by ID' })
  @ApiResponse({
    status: 204,
    description: 'The short has been successfully deleted.',
  })
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string): Promise<void> {
    const userId = req.user.id;
    this.shortService.deleteOneById(userId, id);
  }
}
