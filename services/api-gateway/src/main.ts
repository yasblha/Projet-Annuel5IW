import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Active CORS pour le frontend
  app.enableCors({
    origin: [
      'https://app.aquaerp.cloud', // autorise le frontend en prod
      'http://localhost:8080',     // autorise le frontend en dev local
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    credentials: true,
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway - Système de Facturation')
    .setDescription('Documentation de l\'API Gateway pour le système de facturation microservices')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et autorisation')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('clients', 'Gestion des clients')
    .addTag('agencies', 'Gestion des agences')
    .addTag('contracts', 'Gestion des contrats')
    .addTag('invoices', 'Gestion des factures')
    .addTag('interventions', 'Gestion des interventions')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API Gateway démarré sur le port ${process.env.PORT ?? 3000}`);
  console.log(`📚 Documentation Swagger disponible sur http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
