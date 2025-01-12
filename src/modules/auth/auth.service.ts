import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { CookiesNames } from "src/common/constants/cookie-name.enum";
import { AuthMessages } from "./auth.message";
import { User } from "../user/user.types";
import { LoginDto } from "./dto/login.dto";
import bcryptjs from 'bcryptjs'
import { RegisterDto } from "./dto/register.dto";
import { EnvVariablesNames } from "src/common/constants/env-variables.enum";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ){}

    async refreshToken(req: Request, res: Response){
        const refreshToken = req.cookies[CookiesNames.RefreshToken]
        if(!refreshToken) throw new UnauthorizedException(AuthMessages.RefreshTokenNotFound)

        let payload: any;

        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get(EnvVariablesNames.REFRESH_TOKEN_SECRET)
            })
        } catch (error) {
            throw new UnauthorizedException(AuthMessages.RefreshTokenNotValid)            
        }

        const user = await this.userExists(payload.sub)
        const expiresIn = Math.floor(Date.now()) + 1500
        const accessToken = this.jwtService.sign(
            {...payload, expiresIn},
            {secret : this.configService.get(EnvVariablesNames.ACCESS_TOKEN_SECRET)}
        )

        res.cookie(CookiesNames.AccessToken, accessToken)
        return accessToken
    }

    async register(registerDto: RegisterDto, res: Response){
        const {confirmPassword, email, fullname, password} = registerDto
        const userExists = await this.prisma.user.findUnique({where: {email}})

        if(userExists) throw new BadRequestException(AuthMessages.EmailExists)
        if (password !== confirmPassword ) throw new BadRequestException(AuthMessages.PasswordsNotMatch)
        
        const hashedPassword = await bcryptjs.hash(password, 10)
        const user = await this.prisma.user.create({data: {email, fullname, password: hashedPassword}})

        return this.issueTokens(user, res)
    }

    async login(loginDto: LoginDto, res: Response){
        const {email, password} = loginDto
        const user = await this.validateUser({email, password})
        if (!user) throw new BadRequestException(AuthMessages.InvalidCredentials)
        return this.issueTokens(user, res)
    }

    async logout(res: Response){
        res.clearCookie(CookiesNames.AccessToken)
        res.clearCookie(CookiesNames.RefreshToken)
        return AuthMessages.LoggedOut
    }

    private async userExists(id : number){
        const user = await this.prisma.user.findUnique({where: {id}})
        if (!user) throw new BadRequestException(AuthMessages.UserNoLongerExists)
        
        return user
    }

    private async issueTokens(user: User, res: Response){
        const payload = {username: user.fullname, sub: user.id}

        const accessToken = this.jwtService.sign(
            {...payload}, 
            {
                secret: this.configService.get(EnvVariablesNames.ACCESS_TOKEN_SECRET),
                expiresIn: '150sec'
            }
        )

        const refreshToken = this.jwtService.sign(payload, 
            {
                secret: this.configService.get(EnvVariablesNames.REFRESH_TOKEN_SECRET),
                expiresIn: '7d'
            }
        )

        res.cookie(CookiesNames.AccessToken, accessToken, {httpOnly: true})
        res.cookie(CookiesNames.RefreshToken, refreshToken, {httpOnly: true})

        return {user}
    }

    private async validateUser(loginDto: LoginDto){
        const { email, password } = loginDto
        const user = await this.prisma.user.findUnique({where: {email}})
        const isPasswordTrue = await bcryptjs.compare(password, user.password)

        if (user && isPasswordTrue) return user
        return null
    }
}