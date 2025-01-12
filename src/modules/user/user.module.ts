import { Module } from "@nestjs/common";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [UserResolver, UserService, PrismaService, ConfigService, JwtService]
})
export class UserModule{}