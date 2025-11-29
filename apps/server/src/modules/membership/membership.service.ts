import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMembershipDto, UpdateRoleDto } from './dto/membership.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async findMembers(villageId: string, filter?: string) {
    const where: any = { villageId };

    if (filter === 'admins') {
      where.role = { in: ['chief', 'core_member'] };
    }

    const orderBy: any = filter === 'newest'
      ? { joinedAt: 'desc' }
      : { role: 'asc' };

    const memberships = await this.prisma.membership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
      orderBy,
    });

    // Transform to member format with privacy control
    return memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      nickname: m.nickname,
      avatar: m.localAvatar || m.user.avatar,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
      // Privacy-controlled fields
      email: m.showEmail ? m.user.email : undefined,
      phone: m.showPhone ? m.user.phone : undefined,
      location: m.showLocation ? m.user.location : undefined,
      privacy: {
        showEmail: m.showEmail,
        showPhone: m.showPhone,
        showLocation: m.showLocation,
        showSocials: m.showSocials,
      },
    }));
  }

  async findMember(villageId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    return {
      id: membership.id,
      userId: membership.userId,
      name: membership.user.name,
      nickname: membership.nickname,
      avatar: membership.localAvatar || membership.user.avatar,
      role: membership.role,
      status: membership.status,
      bio: membership.bio,
      balance: membership.balance,
      joinedAt: membership.joinedAt,
      email: membership.showEmail ? membership.user.email : undefined,
      phone: membership.showPhone ? membership.user.phone : undefined,
      location: membership.showLocation ? membership.user.location : undefined,
      privacy: {
        showEmail: membership.showEmail,
        showPhone: membership.showPhone,
        showLocation: membership.showLocation,
        showSocials: membership.showSocials,
      },
    };
  }

  async updateMyProfile(villageId: string, userId: string, dto: UpdateMembershipDto) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId } },
    });

    if (!membership) {
      throw new NotFoundException('Not a member of this village');
    }

    const updated = await this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        nickname: dto.nickname,
        bio: dto.bio,
        status: dto.status,
        showEmail: dto.privacy?.showEmail,
        showPhone: dto.privacy?.showPhone,
        showLocation: dto.privacy?.showLocation,
        showSocials: dto.privacy?.showSocials,
      },
    });

    return updated;
  }

  async updateRole(
    villageId: string,
    targetUserId: string,
    currentUserId: string,
    dto: UpdateRoleDto,
  ) {
    // Check if current user is chief
    const currentMembership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: currentUserId, villageId } },
    });

    if (!currentMembership || currentMembership.role !== 'chief') {
      throw new ForbiddenException('Only chiefs can change roles');
    }

    // Find target membership
    const targetMembership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: targetUserId, villageId } },
    });

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    // Cannot change own role
    if (targetUserId === currentUserId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const updated = await this.prisma.membership.update({
      where: { id: targetMembership.id },
      data: { role: dto.role },
    });

    return updated;
  }

  async removeMember(villageId: string, targetUserId: string, currentUserId: string) {
    // Check if current user has permission
    const currentMembership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: currentUserId, villageId } },
    });

    if (!currentMembership || !['chief', 'core_member'].includes(currentMembership.role)) {
      throw new ForbiddenException('No permission to remove members');
    }

    const targetMembership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: targetUserId, villageId } },
    });

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    // Cannot remove chiefs
    if (targetMembership.role === 'chief') {
      throw new ForbiddenException('Cannot remove a chief');
    }

    // Core members can only remove villagers
    if (currentMembership.role === 'core_member' && targetMembership.role !== 'villager') {
      throw new ForbiddenException('Core members can only remove villagers');
    }

    await this.prisma.membership.delete({
      where: { id: targetMembership.id },
    });

    // Update member count
    await this.prisma.village.update({
      where: { id: villageId },
      data: { memberCount: { decrement: 1 } },
    });

    return { success: true };
  }
}
