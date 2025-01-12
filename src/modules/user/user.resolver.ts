import { ObjectType, Query, Context, Mutation, Args } from "@nestjs/graphql";
import { UserService } from "./user.service";
import { User } from "./user.types";
import { Request } from "express";
import { UseGuards } from "@nestjs/common";
import { GQLGuard } from 'src/common/guards/gql-auth.guard'
import * as GQLUpload from 'graphql-upload/GraphQLUpload.js'

@ObjectType()
export class UserResolver {
    constructor(private readonly userService: UserService){}

    @Mutation(() => User)
    async updateProfile(
        @Args('fullname') fullname: string,
        @Args('file', {type: () => GQLUpload, nullable: true})
        file: GQLUpload.FileUpload,
        @Context() context: {req: Request}
    ){
        const imgUrl = await file ? await this.userService.storeImageAndGetUrl(file): null
        const userId = context.req.user.sub
        return this.userService.updateProfile(userId, fullname, imgUrl)
    }
}