import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {initDatabase} from '@Database/sequelize';

async function bootstrap() {
  await initDatabase()
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
