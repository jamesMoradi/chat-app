import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({message: 'fullname is required'})
    @IsString({message: 'fullname must be a strign'})
    fullname: string

    @Field()
    @IsNotEmpty({message: 'password is required'})
    @MinLength(8, {message: 'password must be at least 8 charecters'})
    password: string

    @Field()
    @IsNotEmpty({message: 'confirm password is required'})
    confirmPassword: string

    @Field()
    @IsNotEmpty({message: 'email is required'})
    @IsEmail({}, {message: 'email must be valid'})
    email: string
}