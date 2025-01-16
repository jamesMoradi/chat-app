import { Args, Context, Mutation, ObjectType, Subscription, Query } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ChatRoomService } from "./chat-room.service";
import { UserService } from "../user/user.service";
import { ChatRoom, Message } from "./chat-room.types";
import { User } from "../user/user.types";
import { UseFilters, UseGuards } from "@nestjs/common";
import { GQLErrorFilter } from "src/common/execption/gql-filter.exception";
import { GQLGuard } from "src/common/guards/gql-auth.guard";
import { Request } from "express";

@ObjectType()
export class ChatRoomResolver {
    public pubSub: PubSub
    constructor(
        private readonly chatRoomService: ChatRoomService,
        private readonly userService: UserService
    ){
        this.pubSub = new PubSub()
    }

    @Subscription(() => Message, {
        nullable: true,
        resolve: (value) => value.newMessage,
    })
    newMessage(@Args('chatroomId') chatroomId: number) {
        return this.pubSub.asyncIterableIterator(`newMessage.${chatroomId}`);
    }

    @Subscription(() => User, {
        nullable: true,
        resolve: (value) => value.user,
        filter: (payload, variables) => {
          console.log('payload1', variables, payload.typingUserId);
          return variables.userId !== payload.typingUserId;
        },
    })
    userStartedTyping(
        @Args('chatRoomId') chatRoomId: number,
        @Args('userId') userId: number,
    ) {
        return this.pubSub.asyncIterableIterator(`userStartedTyping.${chatRoomId}`);
    }

    @Subscription(() => User, {
        nullable: true,
        resolve: (value) => value.user,
        filter: (payload, variables) => {
          return variables.userId !== payload.typingUserId;
        },
    })
      userStoppedTyping(
        @Args('chatRoomId') chatRoomId: number,
        @Args('userId') userId: number,
    ) {
        return this.pubSub.asyncIterableIterator(`userStoppedTyping.${chatRoomId}`);
    }

    @UseFilters(GQLErrorFilter)
    @UseGuards(GQLGuard)
    @Mutation(() => User)
    async userStartedTypingMutation(
      @Args('chatRoomId') chatRoomId: number,
      @Context() context: { req: Request },
    ) {
      const user = await this.userService.getUser(context.req.user.sub);
      await this.pubSub.publish(`userStartedTyping.${chatRoomId}`, {
        user,
        typingUserId: user.id,
      });
      return user;
    }
    @UseFilters(GQLErrorFilter)
    @UseGuards(GQLGuard)
    @Mutation(() => User, {})
    async userStoppedTypingMutation(
      @Args('chatRoomId') chatRoomId: number,
      @Context() context: { req: Request },
    ) {
      const user = await this.userService.getUser(context.req.user.sub);
  
      await this.pubSub.publish(`userStoppedTyping.${chatRoomId}`, {
        user,
        typingUserId: user.id,
      });
  
      return user;
    }
  
    @UseGuards(GQLGuard)
    @Mutation(() => Message)
    async sendMessage(
      @Args('chatRoomId') chatRoomId: number,
      @Args('content') content: string,
      @Context() context: { req: Request },
      @Args('image', { type: () => GraphQLUpload, nullable: true })
      image?: GraphQLUpload,
    ) {
      let imagePath = null;
      if (image) imagePath = await this.chatRoomService.saveImage(image);
      const newMessage = await this.chatRoomService.sendMessage(
        chatRoomId,
        content,
        context.req.user.sub,
        imagePath,
      );
      await this.pubSub
        .publish(`newMessage.${chatRoomId}`, { newMessage })
        .then((res) => {
          console.log('published', res);
        })
        .catch((err) => {
          console.log('err', err);
        });
  
      return newMessage;
    }
  
    @UseFilters(GQLErrorFilter)
    @UseGuards(GQLGuard)
    @Mutation(() => ChatRoom)
    async createChatroom(
      @Args('name') name: string,
      @Context() context: { req: Request },
    ) {
      return this.chatRoomService.createChatroom(name, context.req.user.sub);
    }
  
    @Mutation(() => ChatRoom)
    async addUsersToChatroom(
      @Args('chatRoomId') chatRoomId: number,
      @Args('userIds', { type: () => [Number] }) userIds: number[],
    ) {
      return this.chatRoomService.addUsersToChatroom(chatRoomId, userIds);
    }
  
    @Query(() => [ChatRoom])
    async getChatroomsForUser(@Args('userId') userId: number) {
      
        return this.chatRoomService.getChatroomsForUser(userId);
    }
  
    @Query(() => [Message])
    async getMessagesForChatroom(@Args('chatRoomId') chatRoomId: number) {
      return await this.chatRoomService.getMessagesForChatroom(chatRoomId);
    }

    @Mutation(() => String)
    async deleteChatroom(@Args('chatRoomId') chatRoomId: number) {
      await this.chatRoomService.deleteChatroom(chatRoomId);
      return 'Chatroom deleted successfully';
    }

}