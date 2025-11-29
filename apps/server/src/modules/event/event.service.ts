import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, RsvpEventDto } from './dto/event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async findEvents(villageId: string, userId?: string, page = 1, pageSize = 20, includeAll = false) {
    const skip = (page - 1) * pageSize;

    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      const membership = await this.prisma.membership.findUnique({
        where: { userId_villageId: { userId, villageId } },
      });
      isAdmin = !!membership && ['chief', 'elder'].includes(membership.role);
    }

    // Build where clause - show only approved events for non-admins
    const where: any = { villageId };
    if (!isAdmin && !includeAll) {
      where.OR = [
        { status: 'approved' },
        { organizerId: userId }, // Show user's own pending events
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          rsvps: userId
            ? {
                where: { userId },
                select: { status: true },
              }
            : false,
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.event.count({ where }),
    ]);

    // Get organizer memberships to determine their roles
    const organizerIds = [...new Set(events.map(e => e.organizerId))];
    const memberships = await this.prisma.membership.findMany({
      where: {
        villageId,
        userId: { in: organizerIds },
      },
      select: { userId: true, role: true },
    });
    const roleMap = new Map(memberships.map(m => [m.userId, m.role]));

    const items = events.map((event) => ({
      id: event.id,
      villageId: event.villageId,
      organizerId: event.organizerId,
      organizer: {
        id: event.organizer.id,
        name: event.organizer.name,
        avatar: event.organizer.avatar,
        role: roleMap.get(event.organizerId) || 'villager',
      },
      title: event.title,
      description: event.description,
      coverImage: event.coverImage,
      type: event.type,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      attendeeCount: event.attendeeCount,
      status: event.status,
      myRsvp: userId && (event.rsvps as any[]).length > 0
        ? (event.rsvps as any[])[0].status
        : null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findById(eventId: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        rsvps: userId
          ? {
              where: { userId },
              select: { status: true },
            }
          : false,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      ...event,
      myRsvp: userId && (event.rsvps as any[]).length > 0
        ? (event.rsvps as any[])[0].status
        : null,
    };
  }

  async create(villageId: string, userId: string, dto: CreateEventDto) {
    // Check if user is a member with permission
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId } },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to create events');
    }

    // Auto-approve events from admins (chief or elder)
    const isAdmin = ['chief', 'elder'].includes(membership.role);
    const status = isAdmin ? 'approved' : 'pending';

    const event = await this.prisma.event.create({
      data: {
        villageId,
        organizerId: userId,
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage,
        type: dto.type,
        location: dto.location,
        startTime: new Date(dto.startTime),
        endTime: dto.endTime ? new Date(dto.endTime) : null,
        status,
        reviewedBy: isAdmin ? userId : null,
        reviewedAt: isAdmin ? new Date() : null,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      ...event,
      myRsvp: null,
    };
  }

  async update(eventId: string, userId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check permission
    if (event.organizerId !== userId) {
      const membership = await this.prisma.membership.findUnique({
        where: { userId_villageId: { userId, villageId: event.villageId } },
      });

      if (!membership || !['chief', 'core_member'].includes(membership.role)) {
        throw new ForbiddenException('No permission to update this event');
      }
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage,
        type: dto.type,
        location: dto.location,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async delete(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check permission
    if (event.organizerId !== userId) {
      const membership = await this.prisma.membership.findUnique({
        where: { userId_villageId: { userId, villageId: event.villageId } },
      });

      if (!membership || !['chief', 'core_member'].includes(membership.role)) {
        throw new ForbiddenException('No permission to delete this event');
      }
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return { success: true };
  }

  async rsvp(eventId: string, userId: string, dto: RsvpEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is a member
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId: event.villageId } },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to RSVP');
    }

    const existingRsvp = await this.prisma.eventRsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingRsvp) {
      // Update existing RSVP
      const wasGoing = existingRsvp.status === 'going';
      const isNowGoing = dto.status === 'going';

      await this.prisma.$transaction([
        this.prisma.eventRsvp.update({
          where: { id: existingRsvp.id },
          data: {
            status: dto.status,
            name: dto.name,
            phone: dto.phone,
            note: dto.note,
          },
        }),
        // Update attendee count if status changed
        ...(wasGoing !== isNowGoing
          ? [
              this.prisma.event.update({
                where: { id: eventId },
                data: {
                  attendeeCount: isNowGoing
                    ? { increment: 1 }
                    : { decrement: 1 },
                },
              }),
            ]
          : []),
      ]);
    } else {
      // Create new RSVP
      await this.prisma.$transaction([
        this.prisma.eventRsvp.create({
          data: {
            eventId,
            userId,
            status: dto.status,
            name: dto.name,
            phone: dto.phone,
            note: dto.note,
          },
        }),
        ...(dto.status === 'going'
          ? [
              this.prisma.event.update({
                where: { id: eventId },
                data: { attendeeCount: { increment: 1 } },
              }),
            ]
          : []),
      ]);
    }

    return { status: dto.status };
  }

  async getAttendees(eventId: string, userId?: string, page = 1, pageSize = 20) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is organizer or admin (can see contact details)
    let canSeeDetails = false;
    if (userId) {
      if (event.organizerId === userId) {
        canSeeDetails = true;
      } else {
        const membership = await this.prisma.membership.findUnique({
          where: { userId_villageId: { userId, villageId: event.villageId } },
        });
        canSeeDetails = !!membership && ['chief', 'elder'].includes(membership.role);
      }
    }

    const skip = (page - 1) * pageSize;

    const [rsvps, total] = await Promise.all([
      this.prisma.eventRsvp.findMany({
        where: { eventId, status: 'going' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.eventRsvp.count({
        where: { eventId, status: 'going' },
      }),
    ]);

    return {
      items: rsvps.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        avatar: r.user.avatar,
        rsvpAt: r.createdAt,
        // Include registration details only for organizer/admin
        ...(canSeeDetails && {
          registrationName: r.name,
          phone: r.phone,
          note: r.note,
        }),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      canSeeDetails,
    };
  }

  async approve(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is admin
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId: event.villageId } },
    });

    if (!membership || !['chief', 'elder'].includes(membership.role)) {
      throw new ForbiddenException('Only admins can approve events');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'approved',
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    return { success: true, status: updated.status };
  }

  async reject(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is admin
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId: event.villageId } },
    });

    if (!membership || !['chief', 'elder'].includes(membership.role)) {
      throw new ForbiddenException('Only admins can reject events');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'rejected',
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    return { success: true, status: updated.status };
  }
}
