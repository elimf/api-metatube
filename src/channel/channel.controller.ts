import {
  Controller,
  Get,
  Post,
  Patch,
  Request,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel } from './schema/channel.schema';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  @ApiOperation({ summary: 'Update a channel by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiBearerAuth()
  @ApiBody({ type: Channel, description: 'Updated channel data' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated channel',
    type: Channel,
  })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() channel: Channel,
  ): Promise<Channel> {
    return await this.channelService.update(req.user.id, id, channel);
  }

  @ApiOperation({ summary: 'Delete a channel by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Channel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @Request() req) {
    return this.channelService.deleteOneById(req.user.id ,id);
  }
}
