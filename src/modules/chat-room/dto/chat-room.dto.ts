import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class ChatRoomDto {
    @Field()
    @IsString()
    @IsNotEmpty({message: 'name is required'})
    name: string

    @IsArray()
    @Field(() => [String])
    userIds: string[]
}