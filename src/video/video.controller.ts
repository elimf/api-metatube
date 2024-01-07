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
import { VideoService } from './video.service';
import { Video } from './schema/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
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
import { VideoDetail } from './dto/get-videoDetail.dto';
import { AllVideo } from './dto/get-all-video';

@ApiTags('Video')
@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly utils: Utils,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  @ApiResponse({
    status: 200,
    description: 'List of videos.',
  })
  async findAll(): Promise<AllVideo[]> {
    return this.videoService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Find a video by ID' })
  @ApiResponse({
    status: 200,
    description: 'The video has been found.',
    type: Video,
  })
  async findById(@Param('id') id: string): Promise<VideoDetail> {
    return this.videoService.findById(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new video' })
  @ApiResponse({
    status: 201,
    description: 'The video has been successfully created.',
    type: Video,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnailFile', maxCount: 1 },
        { name: 'videoFile', maxCount: 1 },
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
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFiles()
    files: {
      thumbnailFile: Express.Multer.File[];
      videoFile: Express.Multer.File[];
    },
  ): Promise<Video> {
    const userId = req.user.id;
    const deleteUndesiredFiles = async () => {
      if (files.thumbnailFile) {
        await this.utils.deleteFile(files.thumbnailFile[0].path);
      }
      if (files.videoFile) {
        await this.utils.deleteFile(files.videoFile[0].path);
      }
    };

    if (
      !files.thumbnailFile ||
      files.thumbnailFile.length === 0 ||
      !files.videoFile ||
      files.videoFile.length === 0
    ) {
      await deleteUndesiredFiles();
      throw new BadRequestException(
        'You must provide a thumbnail and a video file.',
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

      createVideoDto.thumbnailUrl = files.thumbnailFile[0].path;
    }

    if (files.videoFile && files.videoFile.length > 0) {
      const videoMime = mime.lookup(files.videoFile[0].path);

      if (videoMime !== 'video/mp4' && videoMime !== 'video/quicktime') {
        await deleteUndesiredFiles();
        throw new BadRequestException(
          "This file type isn't allowed for the video.",
        );
      }

      createVideoDto.videoUrl = files.videoFile[0].path;
    }
    return this.videoService.uploadVideo(createVideoDto, userId);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update a video by ID' })
  @ApiResponse({
    status: 200,
    description: 'The video has been successfully updated.',
    type: Video,
  })
  async update(@Param('id') id: string, @Body() video: Video): Promise<Video> {
    return this.videoService.update(id, video);
  }
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video by ID' })
  @ApiResponse({
    status: 204,
    description: 'The video has been successfully deleted.',
  })
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string): Promise<void> {
    const userId = req.user.id;
    this.videoService.deleteOneById(userId, id);
  }
}
