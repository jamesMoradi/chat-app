import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as GQLUpload from 'graphql-upload/GraphQLUpload.js'
import { createWriteStream } from "fs";
import {v4 as uuidv4} from 'uuid'
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import { EnvVariablesNames } from "src/common/constants/env-variables.enum";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ){}

    async updateProfile(userId: number, fullname: string, avatarUrl: string){
        if (avatarUrl) {
            return await this.prisma.user.update({
                where: {id: userId},
                data: {avatarUrl, fullname}
            })
        } 
        
        return await this.prisma.user.update({
            where: {id: userId},
            data: {fullname}
        })
    }

    async storeImageAndGetUrl(file: GQLUpload){
        const {createReadStream, filename} = await file
        const uniqueFilename = `${uuidv4()}_${filename}`
        const imagePath = join(process.cwd(), 'public', uniqueFilename)
        const imageUrl = `${this.configService.get(EnvVariablesNames.APP_URL)}/${uniqueFilename}`
        const readStream = createReadStream()
        readStream.pipe(createWriteStream(imagePath))
        return imageUrl
    }

    async searchUsers(fullname: string, userId: number) {
        return this.prisma.user.findMany({
          where: {
            fullname: {
              contains: fullname,
            },
            id: {
              not: userId,
            },
          },
        });
      }
    
      async getUsersOfChatroom(chatroomId: number) {
        return this.prisma.user.findMany({
          where: {
            chatRooms: {
              some: {
                id: chatroomId,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
    
      async getUser(userId: number) {
        return this.prisma.user.findUnique({
          where: {
            id: userId,
          },
        });
      }
}