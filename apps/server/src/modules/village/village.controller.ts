import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VillageService } from './village.service';
import { CreateVillageDto, UpdateVillageDto, JoinVillageDto, TransferOwnershipDto } from './dto/village.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('villages')
export class VillageController {
  constructor(private villageService: VillageService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    const villages = await this.villageService.findAll(category);
    return { success: true, data: villages };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const village = await this.villageService.findById(id);
    return { success: true, data: village };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateVillageDto,
  ) {
    const village = await this.villageService.create(userId, dto);
    return { success: true, data: village };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateVillageDto,
  ) {
    const village = await this.villageService.update(id, userId, dto);
    return { success: true, data: village };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async join(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: JoinVillageDto,
  ) {
    const membership = await this.villageService.join(id, userId, dto);
    return { success: true, data: membership };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  async leave(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.villageService.leave(id, userId);
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/regenerate-code')
  async regenerateCode(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const result = await this.villageService.regenerateCode(id, userId);
    return { success: true, data: result };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.villageService.getStats(id);
    return { success: true, data: stats };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    const result = await this.villageService.transferOwnership(id, userId, dto.newOwnerId);
    return { success: true, data: result };
  }
}
