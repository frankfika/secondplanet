import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { UpdateMembershipDto, UpdateRoleDto } from './dto/membership.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('villages/:villageId/members')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get()
  async findMembers(
    @Param('villageId') villageId: string,
    @Query('filter') filter?: string,
  ) {
    const members = await this.membershipService.findMembers(villageId, filter);
    return { success: true, data: members };
  }

  @Get(':userId')
  async findMember(
    @Param('villageId') villageId: string,
    @Param('userId') userId: string,
  ) {
    const member = await this.membershipService.findMember(villageId, userId);
    return { success: true, data: member };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(
    @Param('villageId') villageId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    const membership = await this.membershipService.updateMyProfile(
      villageId,
      userId,
      dto,
    );
    return { success: true, data: membership };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId/role')
  async updateRole(
    @Param('villageId') villageId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('sub') currentUserId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const membership = await this.membershipService.updateRole(
      villageId,
      targetUserId,
      currentUserId,
      dto,
    );
    return { success: true, data: membership };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async removeMember(
    @Param('villageId') villageId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('sub') currentUserId: string,
  ) {
    const result = await this.membershipService.removeMember(
      villageId,
      targetUserId,
      currentUserId,
    );
    return { success: true, data: result };
  }
}
