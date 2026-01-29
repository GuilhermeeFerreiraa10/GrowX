import { prisma } from "../database/prisma.database";

export class TweetService {
  async create(content: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }
    return await prisma.tweet.create({
      data: { content, userId },
      include: { 
        user: true, 
        likes: true,
        _count: { select: { comments: true } } 
      }
    });
  }

  async findAll() {
    return await prisma.tweet.findMany({
      include: {
        user: true,
        likes: true,
        _count: {
          select: {
             likes: true,
             comments: true 
            }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findFollowerFeed(userId: string) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    return await prisma.tweet.findMany({
      where: {
        userId: { in: [...followingIds, userId] }
      },
      include: {
        user: true,
        likes: true,
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}