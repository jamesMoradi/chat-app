import { Module } from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { ChatRoomResolver } from "./chat-room.resolver";
import { PrismaService } from "src/prisma.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [
        ChatRoomService,
        ChatRoomResolver,
        PrismaService,
        UserService,
        JwtService
    ]
})
export class ChatRoomModule {}