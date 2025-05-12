import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initDatabase } from '@Database/sequelize';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Initialisation de la db postgres
  await initDatabase();
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger
  const config = new DocumentBuilder()
      .setTitle('Service Authentification')
      .setDescription('API pour la gestion des utilisateurs et de l’authentification')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ Serveur démarré sur http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger dispo sur http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
