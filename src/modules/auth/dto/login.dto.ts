import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

@InputType()
export class LoginDto {
    @Field()
    @IsNotEmpty({message: 'password is required'})
    @MinLength(8, {message: 'password must be at least 8 charecters'})
    password: string
    
    @Field()
    @IsNotEmpty({message: 'email is required'})
    @IsEmail({}, {message: 'email must be valid'})
    email: string
}
