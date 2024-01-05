import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiBearerAuth()
@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment created successfully.',
  })
  @UseGuards(JwtAuthGuard)
  async createComment(@Request() req, @Body() commentDto: CreateCommentDto) {
    const userId = req.user.id;
    const newComment = await this.commentService.createComment(
      commentDto,
      userId,
    );
    return newComment;
  }

  @Put(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment updated successfully.',
  })
  @ApiOperation({ summary: 'Update a comment by ID' })
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userId = req.user.id;
    const updatedComment = await this.commentService.updateComment(
      id,
      updateCommentDto,
      userId,
    );
    return updatedComment;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment deleted successfully.',
  })
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    await this.commentService.deleteComment(userId, id);
  }
}
