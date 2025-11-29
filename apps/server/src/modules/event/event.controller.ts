import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto, RsvpEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class EventController {
  constructor(private eventService: EventService) {}

  @UseGuards(JwtAuthGuard)
  @Get('villages/:villageId/events')
  async findEvents(
    @Param('villageId') villageId: string,
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.eventService.findEvents(
      villageId,
      userId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('villages/:villageId/events')
  async create(
    @Param('villageId') villageId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    const event = await this.eventService.create(villageId, userId, dto);
    return { success: true, data: event };
  }

  @Get('events/:id')
  async findById(@Param('id') id: string) {
    const event = await this.eventService.findById(id);
    return { success: true, data: event };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('events/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventService.update(id, userId, dto);
    return { success: true, data: event };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('events/:id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.eventService.delete(id, userId);
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('events/:id/rsvp')
  async rsvp(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: RsvpEventDto,
  ) {
    const result = await this.eventService.rsvp(id, userId, dto);
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('events/:id/attendees')
  async getAttendees(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.eventService.getAttendees(
      id,
      userId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('events/:id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.eventService.approve(id, userId);
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('events/:id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.eventService.reject(id, userId);
    return { success: true, data: result };
  }
}
