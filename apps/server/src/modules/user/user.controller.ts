import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.userService.update(userId, dto);
    return { success: true, data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/memberships')
  async getMemberships(@CurrentUser('sub') userId: string) {
    const memberships = await this.userService.getMemberships(userId);
    return { success: true, data: memberships };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/assets')
  async getAssets(@CurrentUser('sub') userId: string) {
    const assets = await this.userService.getAssets(userId);
    return { success: true, data: assets };
  }
}
