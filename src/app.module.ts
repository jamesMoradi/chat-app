import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { ApolloDriver } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { GQLConfig } from "./config/gql.config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ChatRoomModule } from "./modules/chat-room/chat-room.module";
import { LiveChatRoomModule } from './modules/live-chat-room/live-chat-room.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            serveRoot: '/',
        }),
        AuthModule,
        UserModule,
        ChatRoomModule,
        GraphQLModule.forRootAsync(GQLConfig()),
        ConfigModule.forRoot({isGlobal: true}),
        ChatRoomModule,
        LiveChatRoomModule
    ]
})
export class AppModule {}