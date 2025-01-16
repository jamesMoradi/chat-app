import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getChatroom(id: string) {
    return this.prisma.chatRoom.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async createChatroom(name: string, sub: number) {
    const existingChatroom = await this.prisma.chatRoom.findFirst({
      where: {
        name,
      },
    });
    if (existingChatroom) {
      throw new BadRequestException({ name: 'Chatroom already exists' });
    }
    return this.prisma.chatRoom.create({
      data: {
        name,
        users: {
          connect: {
            id: sub,
          },
        },
      },
    });
  }

  async addUsersToChatroom(chatroomId: number, userIds: number[]) {
    const existingChatroom = await this.prisma.chatRoom.findUnique({
      where: {
        id: chatroomId,
      },
    });
    if (!existingChatroom) {
      throw new BadRequestException({ chatroomId: 'Chatroom does not exist' });
    }

    return await this.prisma.chatRoom.update({
      where: {
        id: chatroomId,
      },
      data: {
        users: {
          connect: userIds.map((id) => ({ id: id })),
        },
      },
      include: {
        users: true
      },
    });
  }
  async getChatroomsForUser(userId: number) {
    return this.prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          orderBy: {
            createdAt: 'desc',
          },
        }, 
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
  async sendMessage(
    chatRoomId: number,
    message: string,
    userId: number,
    imagePath: string,
  ) {
    return await this.prisma.message.create({
      data: {
        content: message,
        imageUrl: imagePath,
        chatRoomId,
        userId,
      },
      include: {
        chatRoom: {
          include: {
            users: true, 
          },
        }, 
        user: true, 
      },
    });
  }

  async saveImage(image: {
    createReadStream: () => any;
    filename: string;
    mimetype: string;
  }) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(image.mimetype)) {
      throw new BadRequestException({ image: 'Invalid image type' });
    }

    const imageName = `${Date.now()}-${image.filename}`;
    const imagePath = `${this.configService.get('IMAGE_PATH')}/${imageName}`;
    const stream = image.createReadStream();
    const outputPath = `public${imagePath}`;
    const writeStream = createWriteStream(outputPath);
    stream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    return imagePath;
  }
  async getMessagesForChatroom(chatRoomId: number) {
    return await this.prisma.message.findMany({
      where: {chatRoomId},
      include: {
        chatRoom: {
          include: {
            users: {
              orderBy: {
                createdAt: 'asc',
              },
            }, 
          },
        }, 
        user: true, 
      },
    });
  }

  async deleteChatroom(chatroomId: number) {
    return this.prisma.chatRoom.delete({
      where: {
        id: chatroomId,
      },
    });
  }
}