import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Request } from "express";
import { CookiesNames } from "../constants/cookie-name.enum";
import { EnvVariablesNames } from "../constants/env-variables.enum";

@Injectable()
export class GQLGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlCtx = context.getArgByIndex(2)
        const req: Request = gqlCtx.req
        const token = await this.ExtractCookieFromRequest(req)
        if (!token) throw new UnauthorizedException()
        
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>(EnvVariablesNames.ACCESS_TOKEN_SECRET)
            })
            req.user = payload
        } catch (error) {
            throw new UnauthorizedException(error.message)
        }

        return false    
    }

    private async ExtractCookieFromRequest(req: Request){
        return req.cookies[CookiesNames.AccessToken]
    }
}