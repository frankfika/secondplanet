import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, CreateCommentDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async findPosts(villageId: string, userId?: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { villageId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          likes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.post.count({ where: { villageId } }),
    ]);

    // Get author roles from memberships
    const authorIds = [...new Set(posts.map((p) => p.authorId))];
    const memberships = await this.prisma.membership.findMany({
      where: {
        villageId,
        userId: { in: authorIds },
      },
      select: {
        userId: true,
        role: true,
        nickname: true,
        localAvatar: true,
      },
    });

    const membershipMap = new Map(memberships.map((m) => [m.userId, m]));

    const items = posts.map((post) => {
      const membership = membershipMap.get(post.authorId);
      return {
        id: post.id,
        villageId: post.villageId,
        authorId: post.authorId,
        author: {
          id: post.author.id,
          name: membership?.nickname || post.author.name,
          avatar: membership?.localAvatar || post.author.avatar,
          role: membership?.role || 'villager',
        },
        content: post.content,
        images: JSON.parse(post.images),
        tags: JSON.parse(post.tags),
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        isLiked: userId ? (post.likes as any[]).length > 0 : false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

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

  async findById(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId: post.authorId, villageId: post.villageId } },
      select: { role: true, nickname: true, localAvatar: true },
    });

    return {
      ...post,
      images: JSON.parse(post.images),
      tags: JSON.parse(post.tags),
      author: {
        id: post.author.id,
        name: membership?.nickname || post.author.name,
        avatar: membership?.localAvatar || post.author.avatar,
        role: membership?.role || 'villager',
      },
      isLiked: userId ? (post.likes as any[]).length > 0 : false,
    };
  }

  async create(villageId: string, userId: string, dto: CreatePostDto) {
    // Check if user is a member
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId } },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to post');
    }

    // Get village point rules
    const village = await this.prisma.village.findUnique({
      where: { id: villageId },
      select: { pointRules: true },
    });
    const pointRules = JSON.parse(village?.pointRules || '{}');
    const postPoints = pointRules.post || 0;

    const post = await this.prisma.post.create({
      data: {
        villageId,
        authorId: userId,
        content: dto.content,
        images: JSON.stringify(dto.images || []),
        tags: JSON.stringify(dto.tags || []),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Award points for posting
    if (postPoints > 0) {
      await this.prisma.membership.update({
        where: { id: membership.id },
        data: { balance: { increment: postPoints } },
      });
    }

    return {
      ...post,
      images: JSON.parse(post.images),
      tags: JSON.parse(post.tags),
      author: {
        id: post.author.id,
        name: membership.nickname || post.author.name,
        avatar: membership.localAvatar || post.author.avatar,
        role: membership.role,
      },
      isLiked: false,
      pointsEarned: postPoints,
    };
  }

  async delete(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is the author or has admin privileges
    if (post.authorId !== userId) {
      const membership = await this.prisma.membership.findUnique({
        where: { userId_villageId: { userId, villageId: post.villageId } },
      });

      if (!membership || !['chief', 'core_member'].includes(membership.role)) {
        throw new ForbiddenException('No permission to delete this post');
      }
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { success: true };
  }

  async like(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      return { liked: true };
    }

    // Get village point rules for like_received
    const village = await this.prisma.village.findUnique({
      where: { id: post.villageId },
      select: { pointRules: true },
    });
    const pointRules = JSON.parse(village?.pointRules || '{}');
    const likePoints = pointRules.like_received || 0;

    await this.prisma.$transaction([
      this.prisma.like.create({
        data: { postId, userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
      // Award points to post author for receiving a like
      ...(likePoints > 0 && post.authorId !== userId
        ? [
            this.prisma.membership.updateMany({
              where: { userId: post.authorId, villageId: post.villageId },
              data: { balance: { increment: likePoints } },
            }),
          ]
        : []),
    ]);

    return { liked: true };
  }

  async unlike(postId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (!existingLike) {
      return { liked: false };
    }

    await this.prisma.$transaction([
      this.prisma.like.delete({
        where: { id: existingLike.id },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return { liked: false };
  }

  async getComments(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get memberships for all authors
    const authorIds = new Set<string>();
    comments.forEach((c) => {
      authorIds.add(c.authorId);
      c.replies.forEach((r) => authorIds.add(r.authorId));
    });

    const memberships = await this.prisma.membership.findMany({
      where: {
        villageId: post.villageId,
        userId: { in: [...authorIds] },
      },
      select: {
        userId: true,
        role: true,
        nickname: true,
        localAvatar: true,
      },
    });

    const membershipMap = new Map(memberships.map((m) => [m.userId, m]));

    return comments.map((comment) => {
      const membership = membershipMap.get(comment.authorId);
      return {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        author: {
          id: comment.author.id,
          name: membership?.nickname || comment.author.name,
          avatar: membership?.localAvatar || comment.author.avatar,
          role: membership?.role || 'villager',
        },
        content: comment.content,
        createdAt: comment.createdAt,
        replies: comment.replies.map((reply) => {
          const replyMembership = membershipMap.get(reply.authorId);
          return {
            id: reply.id,
            postId: reply.postId,
            authorId: reply.authorId,
            author: {
              id: reply.author.id,
              name: replyMembership?.nickname || reply.author.name,
              avatar: replyMembership?.localAvatar || reply.author.avatar,
              role: replyMembership?.role || 'villager',
            },
            content: reply.content,
            createdAt: reply.createdAt,
          };
        }),
      };
    });
  }

  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is a member
    const membership = await this.prisma.membership.findUnique({
      where: { userId_villageId: { userId, villageId: post.villageId } },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to comment');
    }

    // Get village point rules
    const village = await this.prisma.village.findUnique({
      where: { id: post.villageId },
      select: { pointRules: true },
    });
    const pointRules = JSON.parse(village?.pointRules || '{}');
    const commentPoints = pointRules.comment || 0;

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          parentId: dto.parentId,
          content: dto.content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    // Award points for commenting
    if (commentPoints > 0) {
      await this.prisma.membership.update({
        where: { id: membership.id },
        data: { balance: { increment: commentPoints } },
      });
    }

    return {
      ...comment,
      author: {
        id: comment.author.id,
        name: membership.nickname || comment.author.name,
        avatar: membership.localAvatar || comment.author.avatar,
        role: membership.role,
      },
      pointsEarned: commentPoints,
    };
  }
}
