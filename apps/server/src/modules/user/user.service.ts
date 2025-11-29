import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        globalId: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        avatar: dto.avatar,
        location: dto.location,
      },
    });

    return this.sanitizeUser(user);
  }

  async getMemberships(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        village: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            category: true,
            memberCount: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships;
  }

  async getAssets(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        village: {
          select: {
            name: true,
            currencyName: true,
            currencySymbol: true,
          },
        },
      },
    });

    return memberships.map((m) => ({
      villageId: m.villageId,
      villageName: m.village.name,
      currencyName: m.village.currencyName,
      currencySymbol: m.village.currencySymbol,
      balance: m.balance,
    }));
  }

  private sanitizeUser(user: any) {
    const { passwordHash, wechatOpenId, wechatUnionId, appleId, ...sanitized } = user;
    return sanitized;
  }
}
