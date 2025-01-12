import { ApolloDriver } from "@nestjs/apollo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GqlModuleAsyncOptions, GqlModuleOptions } from "@nestjs/graphql";
import { join } from "path";
import { AppModule } from "src/app.module";
import { TokenService } from "src/modules/auth/token.service";
import { pubSub } from "./redis.config";

export const GQLConfig = (): GqlModuleAsyncOptions<GqlModuleOptions<any>> => {
    return {
        imports: [ConfigModule, AppModule],
        inject: [ConfigService],
        driver: ApolloDriver,
        useFactory: async (
          configService: ConfigService,
          tokenService: TokenService,
        ) => {
          return {
            installSubscriptionHandlers: true,
            playground: true,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            subscriptions: {
              'graphql-ws': true,
              'subscriptions-transport-ws': true,
            },
            onConnect: (connectionParams) => {
              const token = tokenService.extractToken(connectionParams);
    
              if (!token) {
                throw new Error('Token not provided');
              }
              const user = tokenService.validateToken(token);
              if (!user) {
                throw new Error('Invalid token');
              }
              return { user };
            },
            context: ({ req, res, connection }) => {
              if (connection) {
                return { req, res, user: connection.context.user, pubSub };
              }
              return { req, res };
            },
          };
        },
    }
}

