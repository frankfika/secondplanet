import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VillageModule } from './modules/village/village.module';
import { MembershipModule } from './modules/membership/membership.module';
import { PostModule } from './modules/post/post.module';
import { EventModule } from './modules/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    VillageModule,
    MembershipModule,
    PostModule,
    EventModule,
  ],
})
export class AppModule {}
