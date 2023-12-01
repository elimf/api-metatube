import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel } from './schema/channel.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateChannelDto } from './dto/create-channel.dto';
import { BannerUpdateDto } from './dto/banner-update.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Channel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @ApiOperation({ summary: 'Create a channel' })
  @ApiBody({ type: CreateChannelDto, description: 'Channel data to create' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Channel created successfully',
    type: Channel,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createChannel(
    @Request() req,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const userId = req.user.id;
    return await this.channelService.create(createChannelDto, userId);
  }

  @ApiOperation({ summary: 'Get all channels' })
  @ApiResponse({
    status: 200,
    description: 'Return the list of all channels',
    type: [Channel],
  })
  @Get()
  async findAll(): Promise<Channel[]> {
    return await this.channelService.findAll();
  }

  @ApiOperation({ summary: 'Get a channel by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the channel by ID',
    type: Channel,
  })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Channel> {
    return await this.channelService.findById(id);
  }

  @ApiOperation({ summary: 'Update a channel' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateChannelDto, description: 'Updated channel data' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated channel',
    type: Channel,
  })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Body() channel: UpdateChannelDto,
  ): Promise<Channel> {
    return await this.channelService.update(req.user.id, channel);
  }

  @ApiBearerAuth()
  @ApiBody({ type: BannerUpdateDto, description: 'Updated channel banner' })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a channel banner' })
  @ApiResponse({
    status: 204,
    description: 'Updated channel banner',
  })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @Put()
  @UseInterceptors(
    FileInterceptor('banner', {
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
  async updateBanner(
    @Request() req,
    @UploadedFile() banner: Express.Multer.File,
  ): Promise<Channel> {
    console.log(banner.path);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return await this.channelService.updateBanner(req.user.id,banner.path);
  }

  @ApiOperation({ summary: 'Delete a channel by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Channel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @Delete()
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  delete(@Request() req) {
    return this.channelService.deleteOneById(req.user.id);
  }
}
