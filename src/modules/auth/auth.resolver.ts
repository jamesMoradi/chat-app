import { Args, Context, Mutation, ObjectType, Query } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { LoginResponse, RegisterResponse } from './auth.types'
import { RegisterDto } from './dto/register.dto'
import { Request, Response } from 'express'
import { LoginDto } from './dto/login.dto'
import { BadRequestException, UseGuards } from '@nestjs/common'
import { GQLGuard } from 'src/common/guards/gql-auth.guard'

@ObjectType()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => RegisterResponse)
    register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: {res: Response}
    ){
        return this.authService.register(registerDto, context.res)
    }

    @Mutation(() => LoginResponse)
    login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: {res: Response}
    ){
        return this.authService.login(loginDto, context.res)
    }

    @Mutation(() => String)
    @UseGuards(GQLGuard)
    logout(@Context() context: {res: Response}){
        return this.authService.logout(context.res)
    }

    @Mutation(() => String)
    refreshToken(@Context() context: {req: Request, res: Response}){
        const {req, res} = context
        try {
            return this.authService.refreshToken(req, res)            
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    @Query(() => String)
sayHello(): string {
return 'Hello World!';
}
}