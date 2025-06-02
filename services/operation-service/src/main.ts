import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Pipes de validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Service Opérationnel')
    .setDescription(`
      API pour la gestion des opérations de terrain et interventions techniques.
      
      Fonctionnalités principales:
      - Planification intelligente des interventions
      - Génération automatique de bons d'intervention  
      - Suivi des incidents avec priorisation
      - Intégration IoT pour relevés à distance
      - Notifications temps réel pour les équipes
    `)
    .setVersion('1.0')
    .addTag('interventions', 'Gestion des interventions techniques')
    .addTag('incidents', 'Signalement et suivi des incidents')
    .addTag('iot', 'Intégration IoT et relevés automatiques')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Service Opérationnel - API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Service Opérationnel démarré sur le port ${port}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${port}/api`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap();
