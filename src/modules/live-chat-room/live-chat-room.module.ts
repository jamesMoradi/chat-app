import { Module } from '@nestjs/common';
import { LiveChatRoomService } from './live-chat-room.service';
import { LiveChatRoomResolver } from './live-chat-room.resolver';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    LiveChatRoomResolver, 
    LiveChatRoomService,
    UserService,
    PrismaService,
    JwtService,
  ],
})
export class LiveChatRoomModule {}
