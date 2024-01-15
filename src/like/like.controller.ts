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
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Likes')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Put()
  @ApiOperation({ summary: 'Manage your like' })
  @ApiBody({ type: CreateLikeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Like added or removed successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async manageLike(@Request() req, @Body() createLikeDto: CreateLikeDto) {
    const userId = req.user.id;
    const existingLike = await this.likeService.findLike(
      userId,
      createLikeDto.entityId,
      createLikeDto.entityType,
    );

    if (existingLike) {
      // Si le like existe, le supprimer
      await this.likeService.removeLike(
        userId,
        createLikeDto.entityId,
        createLikeDto.entityType,
        existingLike._id,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Like removed successfully.',
      };
    } else {
      // Si le like n'existe pas, l'ajouter
      await this.likeService.addLike(
        userId,
        createLikeDto.entityId,
        createLikeDto.entityType,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Like added successfully.',
      };
    }
  }
}
