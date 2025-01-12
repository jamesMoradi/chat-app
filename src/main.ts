import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsConfig } from './config/cors.config';
import * as cookieParser from 'cookie-parser';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import { ValidationPipe } from '@nestjs/common';
import { ValidationPipeConfig } from './config/validation-pipe.config';

async function bootstrap() {
  const PORT = +process.env.PORT || 3000
  const app = await NestFactory.create(AppModule);
  
  //configs
  app.enableCors(CorsConfig())
  app.use(cookieParser())
  app.use(graphqlUploadExpress({ maxFileSize: 10000000000, maxFiles: 1 }))
  app.useGlobalPipes(new ValidationPipe(ValidationPipeConfig()))

  await app.listen(PORT, () => console.log(`chat-app is running on port ${PORT}`));
}
bootstrap();
