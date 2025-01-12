import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { ApolloDriver } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { GQLConfig } from "./config/gql.config";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot: '/',
        }),
        AuthModule,
        UserModule,
        GraphQLModule.forRootAsync(GQLConfig()),
        ConfigModule.forRoot({isGlobal: true})
    ]
})
export class AppModule {}