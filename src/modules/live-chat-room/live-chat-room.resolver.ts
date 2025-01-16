import { Args, Context, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { LiveChatRoomService } from './live-chat-room.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GQLGuard } from 'src/common/guards/gql-auth.guard';
import { Request } from 'express';
import { PubSub } from "graphql-subscriptions";
import { GQLErrorFilter } from 'src/common/execption/gql-filter.exception';

@Resolver()
export class LiveChatRoomResolver {
  private pubSub: PubSub;
  constructor(
    private readonly liveChatroomService: LiveChatRoomService,
    private readonly userService: UserService,
  ) {
    this.pubSub = new PubSub();
  }

  @Subscription(() => [User], {
    nullable: true,
    resolve: (value) => value.liveUsers,
    filter: (payload, variables) => {
      return payload.chatroomId === variables.chatroomId;
    },
  })
  liveUsersInChatroom(@Args('chatroomId') chatroomId: number) {
    return this.pubSub.asyncIterableIterator(`liveUsersInChatroom.${chatroomId}`);
  }

  @UseFilters(GQLErrorFilter)
  @UseGuards(GQLGuard)
  @Mutation(() => Boolean)
  async enterChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: Request },
  ) {
    const user = await this.userService.getUser(context.req.user.sub);
    await this.liveChatroomService.addLiveUserToChatroom(chatroomId, user);
    const liveUsers = await this.liveChatroomService
      .getLiveUsersForChatroom(chatroomId)
      .catch((err) => {
        console.log('getLiveUsersForChatroom error', err);
      });

    await this.pubSub
      .publish(`liveUsersInChatroom.${chatroomId}`, {
        liveUsers,
        chatroomId,
      })
      .catch((err) => {
        console.log('pubSub error', err);
      });
    return true;
  }

  @UseFilters(GQLErrorFilter)
  @UseGuards(GQLGuard)
  @Mutation(() => Boolean)
  async leaveChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: Request },
  ) {
    const user = await this.userService.getUser(context.req.user.sub);
    await this.liveChatroomService.removeLiveUserFromChatroom(chatroomId, user);
    const liveUsers = await this.liveChatroomService.getLiveUsersForChatroom(
      chatroomId,
    );
    await this.pubSub.publish(`liveUsersInChatroom.${chatroomId}`, {
      liveUsers,
      chatroomId,
    });

    return true;
  }
}
