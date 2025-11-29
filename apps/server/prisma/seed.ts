import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const passwordHash = await bcrypt.hash('123456', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash },
    create: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: { passwordHash },
    create: {
      email: 'alice@example.com',
      passwordHash,
      name: 'Alice Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: { passwordHash },
    create: {
      email: 'bob@example.com',
      passwordHash,
      name: 'Bob Wang',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  });

  console.log('✅ Created users');

  // Create villages
  const village1 = await prisma.village.upsert({
    where: { slug: 'tech-innovators' },
    update: {},
    create: {
      name: 'Tech Innovators',
      slug: 'tech-innovators',
      category: 'Professional',
      description: 'A community for tech enthusiasts and innovators to share ideas and collaborate on projects.',
      announcement: 'Welcome to Tech Innovators! Share your latest projects and discoveries.',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      icon: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=100&q=80',
      currencyName: 'TechCoins',
      currencySymbol: '💎',
      ownerId: user1.id,
      memberCount: 3,
    },
  });

  const village2 = await prisma.village.upsert({
    where: { slug: 'coffee-lovers' },
    update: {},
    create: {
      name: 'Coffee Lovers',
      slug: 'coffee-lovers',
      category: 'Lifestyle',
      description: 'For those who appreciate the art of coffee. Share brewing tips, favorite cafes, and more.',
      announcement: 'New member? Introduce yourself and your favorite coffee!',
      coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
      icon: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=100&q=80',
      currencyName: 'Beans',
      currencySymbol: '☕',
      ownerId: user2.id,
      memberCount: 2,
    },
  });

  const village3 = await prisma.village.upsert({
    where: { slug: 'bookworms-club' },
    update: {},
    create: {
      name: 'Bookworms Club',
      slug: 'bookworms-club',
      category: 'Interest',
      description: 'A cozy place for book lovers to discuss their latest reads and share recommendations.',
      announcement: 'This month we are reading "The Midnight Library"!',
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80',
      icon: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=100&q=80',
      currencyName: 'Pages',
      currencySymbol: '📚',
      ownerId: user3.id,
      memberCount: 2,
    },
  });

  console.log('✅ Created villages');

  // Create memberships
  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user1.id, villageId: village1.id } },
    update: {},
    create: {
      userId: user1.id,
      villageId: village1.id,
      nickname: 'Tech Lead',
      bio: 'Building cool stuff',
      role: 'chief',
    },
  });

  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user2.id, villageId: village1.id } },
    update: {},
    create: {
      userId: user2.id,
      villageId: village1.id,
      nickname: 'Alice',
      bio: 'Frontend developer',
      role: 'villager',
    },
  });

  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user3.id, villageId: village1.id } },
    update: {},
    create: {
      userId: user3.id,
      villageId: village1.id,
      nickname: 'Bob',
      bio: 'Backend developer',
      role: 'villager',
    },
  });

  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user2.id, villageId: village2.id } },
    update: {},
    create: {
      userId: user2.id,
      villageId: village2.id,
      nickname: 'Coffee Queen',
      bio: 'Certified barista',
      role: 'chief',
    },
  });

  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user1.id, villageId: village2.id } },
    update: {},
    create: {
      userId: user1.id,
      villageId: village2.id,
      nickname: 'Caffeine Addict',
      bio: 'Need coffee to code',
      role: 'villager',
    },
  });

  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user3.id, villageId: village3.id } },
    update: {},
    create: {
      userId: user3.id,
      villageId: village3.id,
      nickname: 'Bookworm Bob',
      bio: 'Reading 50 books a year',
      role: 'chief',
    },
  });

  await prisma.membership.upsert({
    where: { userId_villageId: { userId: user1.id, villageId: village3.id } },
    update: {},
    create: {
      userId: user1.id,
      villageId: village3.id,
      nickname: 'SciFi Fan',
      bio: 'Love science fiction',
      role: 'villager',
    },
  });

  console.log('✅ Created memberships');

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      villageId: village1.id,
      authorId: user1.id,
      content: 'Just launched our new AI-powered feature! The team has been working on this for months. What do you think? 🚀',
      tags: JSON.stringify(['announcement', 'ai', 'launch']),
      likeCount: 2,
      commentCount: 2, // Actual: 2 comments created below
    },
  });

  const post2 = await prisma.post.create({
    data: {
      villageId: village1.id,
      authorId: user2.id,
      content: 'Anyone interested in a hackathon next weekend? We could build something cool together! 💻',
      tags: JSON.stringify(['hackathon', 'collaboration']),
      likeCount: 0,
      commentCount: 1, // Actual: 1 comment created below
    },
  });

  const post3 = await prisma.post.create({
    data: {
      villageId: village2.id,
      authorId: user2.id,
      content: 'Found this amazing pour-over technique that completely changed my morning routine. The key is the water temperature - 93°C is perfect! ☕',
      tags: JSON.stringify(['tips', 'pour-over']),
      likeCount: 1,
      commentCount: 1, // Actual: 1 comment created below
    },
  });

  const post4 = await prisma.post.create({
    data: {
      villageId: village3.id,
      authorId: user3.id,
      content: 'Just finished "Project Hail Mary" by Andy Weir. Absolutely loved it! The science is fascinating and the story keeps you hooked. Highly recommend! 📖',
      tags: JSON.stringify(['review', 'scifi']),
      likeCount: 2,
      commentCount: 0, // No comments for this post
    },
  });

  console.log('✅ Created posts');

  // Create comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user2.id,
      content: 'This looks amazing! Can\'t wait to try it out.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: user3.id,
      content: 'Great work team! The AI feature is really smooth.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: user1.id,
      content: 'I\'m in! What kind of projects are you thinking?',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: user1.id,
      content: 'Thanks for sharing! I\'ve been struggling with my pour-over.',
    },
  });

  console.log('✅ Created comments');

  // Create events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(19, 0, 0, 0);

  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  inTwoDays.setHours(18, 30, 0, 0);

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  inThreeDays.setHours(10, 0, 0, 0);

  // Events organized by Alice (user2) - test@example.com user hasn't joined these
  await prisma.event.create({
    data: {
      villageId: village1.id,
      organizerId: user2.id,
      title: 'React 19 Deep Dive Workshop',
      description: 'Learn about the new features in React 19 including Server Components, Actions, and more. Bring your laptop!',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      type: 'Online',
      location: 'Zoom Meeting - Link will be sent after RSVP',
      startTime: tomorrow,
      attendeeCount: 18,
      status: 'approved',
    },
  });

  await prisma.event.create({
    data: {
      villageId: village1.id,
      organizerId: user2.id,
      title: 'Hackathon Weekend',
      description: 'Build something amazing in 48 hours! Teams of 2-4 people. Prizes for the best projects.',
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      type: 'Offline',
      location: 'TechHub Coworking Space, Building A',
      startTime: nextWeek,
      attendeeCount: 25,
      status: 'approved',
    },
  });

  // Events organized by Bob (user3)
  await prisma.event.create({
    data: {
      villageId: village1.id,
      organizerId: user3.id,
      title: 'Code Review Best Practices',
      description: 'Learn how to give and receive constructive code reviews. We will go through real examples and discuss common pitfalls.',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      type: 'Online',
      location: 'Google Meet',
      startTime: inTwoDays,
      attendeeCount: 12,
      status: 'approved',
    },
  });

  await prisma.event.create({
    data: {
      villageId: village1.id,
      organizerId: user3.id,
      title: 'Weekend Coding Bootcamp',
      description: 'Intensive 2-day bootcamp covering TypeScript, Node.js, and modern web development practices. Perfect for leveling up your skills!',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      type: 'Offline',
      location: 'Downtown Library, Conference Room B',
      startTime: inThreeDays,
      attendeeCount: 8,
      status: 'approved',
    },
  });

  // Coffee village events
  await prisma.event.create({
    data: {
      villageId: village2.id,
      organizerId: user2.id,
      title: 'Coffee Tasting Session',
      description: 'Try 5 different single-origin coffees from around the world. Learn about flavor profiles and brewing methods.',
      coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      type: 'Offline',
      location: 'The Brew House, Downtown',
      startTime: nextWeek,
      attendeeCount: 12,
      status: 'approved',
    },
  });

  await prisma.event.create({
    data: {
      villageId: village2.id,
      organizerId: user2.id,
      title: 'Latte Art Masterclass',
      description: 'Learn the secrets of professional latte art from our resident barista. All skill levels welcome!',
      coverImage: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
      type: 'Offline',
      location: 'Artisan Coffee Lab',
      startTime: inTwoDays,
      attendeeCount: 6,
      status: 'approved',
    },
  });

  // Book club events
  await prisma.event.create({
    data: {
      villageId: village3.id,
      organizerId: user3.id,
      title: 'Monthly Book Club Meeting',
      description: 'Discussing "The Midnight Library" by Matt Haig. Bring your thoughts and favorite quotes!',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
      type: 'Online',
      location: 'Discord Voice Channel',
      startTime: tomorrow,
      attendeeCount: 8,
      status: 'approved',
    },
  });

  await prisma.event.create({
    data: {
      villageId: village3.id,
      organizerId: user3.id,
      title: 'Author Q&A: Science Fiction Writers',
      description: 'Live Q&A session with up-and-coming sci-fi authors. Submit your questions in advance!',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      type: 'Online',
      location: 'YouTube Live Stream',
      startTime: nextWeek,
      attendeeCount: 45,
      status: 'approved',
    },
  });

  console.log('✅ Created events');

  // Create some likes
  await prisma.like.create({
    data: { postId: post1.id, userId: user2.id },
  });
  await prisma.like.create({
    data: { postId: post1.id, userId: user3.id },
  });
  await prisma.like.create({
    data: { postId: post3.id, userId: user1.id },
  });
  await prisma.like.create({
    data: { postId: post4.id, userId: user1.id },
  });
  await prisma.like.create({
    data: { postId: post4.id, userId: user2.id },
  });

  console.log('✅ Created likes');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Test accounts:');
  console.log('   Email: test@example.com, Password: 123456');
  console.log('   Email: alice@example.com, Password: 123456');
  console.log('   Email: bob@example.com, Password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
