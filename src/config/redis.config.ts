import { RedisPubSub } from 'graphql-redis-subscriptions'

export const pubSub = new RedisPubSub({
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    },
});