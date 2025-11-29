import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, CreateCommentDto } from './dto/post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class PostController {
  constructor(private postService: PostService) {}

  @Get('villages/:villageId/posts')
  async findPosts(
    @Param('villageId') villageId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.postService.findPosts(
      villageId,
      undefined,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('villages/:villageId/posts')
  async create(
    @Param('villageId') villageId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    const post = await this.postService.create(villageId, userId, dto);
    return { success: true, data: post };
  }

  @Get('posts/:id')
  async findById(@Param('id') id: string) {
    const post = await this.postService.findById(id);
    return { success: true, data: post };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.postService.delete(id, userId);
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  async like(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.postService.like(id, userId);
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/like')
  async unlike(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.postService.unlike(id, userId);
    return { success: true, data: result };
  }

  @Get('posts/:id/comments')
  async getComments(@Param('id') id: string) {
    const comments = await this.postService.getComments(id);
    return { success: true, data: comments };
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  async createComment(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.postService.createComment(id, userId, dto);
    return { success: true, data: comment };
  }
}
