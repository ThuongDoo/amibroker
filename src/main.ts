import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as passport from 'passport';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // TODO: prodution
  // app.set('trust proxy', 1);
  app.setGlobalPrefix('api/v1');

  app.use(
    session({
      // TODO: change secret
      secret: 'mysecretkey',
      resave: false,
      saveUninitialized: false,
      // TODO: prodution
      // cookie: { secure: true },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());
  app.enableCors({
    origin: [
      // '*',
      'http://192.168.0.118:8081',
      'http://localhost:3001',
      'http://42.118.137.1:3001',
      '*',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
