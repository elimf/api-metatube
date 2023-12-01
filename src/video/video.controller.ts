import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from './schema/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async findAll(): Promise<Video[]> {
    return this.videoService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Video> {
    return this.videoService.findById(id);
  }

  @Post()
  async create(@Body() video: CreateVideoDto): Promise<Video> {
    return this.videoService.uploadVideo(video);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() video: Video): Promise<Video> {
    return this.videoService.update(id, video);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
     this.videoService.delete(id);
  }
}
