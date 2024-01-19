import {
  Controller,
  Put,
  Body,
  HttpStatus,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger'; // Importez ApiBody pour définir le modèle de corps de la requête
import { SubscribeService } from './subscribe.service';
import { CreateSubscribeDto } from '../subscribe/dto/create-subscribe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Subscribe')
@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Put()
  @ApiOperation({ summary: 'Manage your Subscribe' })
  @ApiBody({ type: CreateSubscribeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscribe added or removed successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async manageSubscribe(
    @Request() req,
    @Body() createSubscribeDto: CreateSubscribeDto,
  ) {
    const userId = req.user.id;
    
    const existingSubscribe = await this.subscribeService.findSubscribe(
      userId,
      createSubscribeDto.channelId,
    );
      
    if (existingSubscribe) {
      // Si le Subscribe existe, le supprimer
      await this.subscribeService.removeSubscribe(
        userId,
        createSubscribeDto.channelId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Subscribe removed successfully.',
      };
    } else {
      // Si le Subscribe n'existe pas, l'ajouter
      await this.subscribeService.addSubscribe(
        userId,
        createSubscribeDto.channelId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Subscribe added successfully.',
      };
    }
  }
}
