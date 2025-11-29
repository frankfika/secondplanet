import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVillageDto, UpdateVillageDto, JoinVillageDto } from './dto/village.dto';

@Injectable()
export class VillageService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: any = { visibility: 'public' };
    if (category && category !== 'All') {
      where.category = category;
    }

    const villages = await this.prisma.village.findMany({
      where,
      orderBy: { memberCount: 'desc' },
    });

    return villages.map((v) => ({
      ...v,
      constitution: JSON.parse(v.constitution),
    }));
  }

  async findById(id: string) {
    const village = await this.prisma.village.findUnique({
      where: { id },
    });

    if (!village) {
      throw new NotFoundException('Village not found');
    }

    return {
      ...village,
      constitution: JSON.parse(village.constitution),
      pointRules: JSON.parse(village.pointRules),
    };
  }

  async findBySlug(slug: string) {
    const village = await this.prisma.village.findUnique({
      where: { slug },
    });

    if (!village) {
      throw new NotFoundException('Village not found');
    }

    return {
      ...village,
      constitution: JSON.parse(village.constitution),
      pointRules: JSON.parse(village.pointRules),
    };
  }

  async create(userId: string, dto: CreateVillageDto) {
    // Generate slug from name
    const slug = this.generateSlug(dto.name);

    // Check if slug exists
    const existing = await this.prisma.village.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Village name already taken');
    }

    // Generate invite code if private
    const inviteCode = dto.visibility === 'private'
      ? this.generateInviteCode()
      : null;

    // Create village
    const village = await this.prisma.village.create({
      data: {
        name: dto.name,
        slug,
        category: dto.category,
        description: dto.description || '',
        currencyName: dto.currencyName || 'Coins',
        currencySymbol: dto.currencySymbol || '🪙',
        visibility: dto.visibility || 'public',
        inviteCode,
        ownerId: userId,
        memberCount: 1,
      },
    });

    // Create owner membership as chief
    await this.prisma.membership.create({
      data: {
        userId,
        villageId: village.id,
        nickname: 'Founder',
        role: 'chief',
      },
    });

    return {
      ...village,
      constitution: JSON.parse(village.constitution),
    };
  }

  async update(villageId: string, userId: string, dto: UpdateVillageDto) {
    const village = await this.findById(villageId);

    // Check if user is the owner
    if (village.ownerId !== userId) {
      const membership = await this.prisma.membership.findUnique({
        where: { userId_villageId: { userId, villageId } },
      });

      if (!membership || membership.role !== 'chief') {
        throw new ForbiddenException('Only the chief can update the village');
      }
    }

    // Generate invite code if switching to private
    let inviteCode = village.inviteCode;
    if (dto.visibility === 'private' && !inviteCode) {
      inviteCode = this.generateInviteCode();
    }

    // Prepare update data, converting arrays/objects to JSON strings
    const updateData: any = { ...dto, inviteCode };
    if (dto.constitution) {
      updateData.constitution = JSON.stringify(dto.constitution);
    }
    if (dto.pointRules) {
      updateData.pointRules = JSON.stringify(dto.pointRules);
    }

    const updated = await this.prisma.village.update({
      where: { id: villageId },
      data: updateData,
    });

    return {
      ...updated,
      constitution: JSON.parse(updated.constitution),
      pointRules: JSON.parse(updated.pointRules),
    };
  }

  async join(villageId: string, userId: string, dto?: JoinVillageDto) {
    const village = await this.findById(villageId);

    // Check if already a member
    const existing = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId } },
    });

    if (existing) {
      throw new ConflictException('Already a member of this village');
    }

    // Check invite code for private villages
    if (village.visibility === 'private') {
      if (!dto?.inviteCode || dto.inviteCode !== village.inviteCode) {
        throw new BadRequestException('Invalid invite code');
      }
    }

    // Get user for default nickname
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Create membership
    const membership = await this.prisma.membership.create({
      data: {
        userId,
        villageId,
        nickname: user?.name || 'New Member',
        role: 'villager',
      },
    });

    // Update member count
    await this.prisma.village.update({
      where: { id: villageId },
      data: { memberCount: { increment: 1 } },
    });

    return membership;
  }

  async leave(villageId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId } },
    });

    if (!membership) {
      throw new NotFoundException('Not a member of this village');
    }

    // Chiefs cannot leave (must transfer ownership first)
    if (membership.role === 'chief') {
      throw new ForbiddenException('Chiefs cannot leave. Transfer ownership first.');
    }

    await this.prisma.membership.delete({
      where: { id: membership.id },
    });

    // Update member count
    await this.prisma.village.update({
      where: { id: villageId },
      data: { memberCount: { decrement: 1 } },
    });

    return { success: true };
  }

  async regenerateCode(villageId: string, userId: string) {
    const village = await this.findById(villageId);

    if (village.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can regenerate the invite code');
    }

    const newCode = this.generateInviteCode();

    await this.prisma.village.update({
      where: { id: villageId },
      data: { inviteCode: newCode },
    });

    return { inviteCode: newCode };
  }

  async getStats(villageId: string) {
    const village = await this.findById(villageId);

    const [totalPosts, todayMembers] = await Promise.all([
      this.prisma.post.count({ where: { villageId } }),
      this.prisma.membership.count({
        where: {
          villageId,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      memberCount: village.memberCount,
      activeToday: todayMembers,
      totalPosts,
    };
  }

  async transferOwnership(villageId: string, currentOwnerId: string, newOwnerId: string) {
    const village = await this.findById(villageId);

    // Only the current owner can transfer ownership
    if (village.ownerId !== currentOwnerId) {
      throw new ForbiddenException('Only the owner can transfer ownership');
    }

    // Check if new owner is a member
    const newOwnerMembership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: newOwnerId, villageId } },
    });

    if (!newOwnerMembership) {
      throw new BadRequestException('New owner must be a member of the village');
    }

    // Can't transfer to yourself
    if (currentOwnerId === newOwnerId) {
      throw new BadRequestException('Cannot transfer ownership to yourself');
    }

    // Get the current owner's membership
    const currentOwnerMembership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: currentOwnerId, villageId } },
    });

    // Perform the transfer in a transaction
    await this.prisma.$transaction([
      // Update village owner
      this.prisma.village.update({
        where: { id: villageId },
        data: { ownerId: newOwnerId },
      }),
      // Demote current owner to elder
      this.prisma.membership.update({
        where: { id: currentOwnerMembership!.id },
        data: { role: 'elder' },
      }),
      // Promote new owner to chief
      this.prisma.membership.update({
        where: { id: newOwnerMembership.id },
        data: { role: 'chief' },
      }),
    ]);

    return { success: true, newOwnerId };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 6);
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
