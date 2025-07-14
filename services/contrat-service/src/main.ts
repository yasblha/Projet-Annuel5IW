import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
// import { initDatabase } from '@Database/sequelize'; // Décommente si tu as une init DB
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from '@infrastructure/interceptors/sentry.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // await initDatabase(); // Décommente si tu as une init DB

  const app = await NestFactory.create(AppModule, { cors: true });

  // Initialisation de Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '0.0.0',
    debug: process.env.NODE_ENV !== 'production',
    tracesSampleRate: 1.0, // Réduire en production (0.2 par exemple)
  });
  
  // Application de l'intercepteur Sentry pour toutes les routes
  app.useGlobalInterceptors(new SentryInterceptor());

  app.enableCors({
    origin: [
      'https://app.aquaerp.cloud',
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Service Contrat')
    .setDescription('API pour la gestion des contrats')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuration du microservice RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'contract_queue',
      queueOptions: { durable: true },
    },
  });

  try {
    await app.startAllMicroservices();
    await app.listen(process.env.PORT ?? 3000);
    logger.log(`✅ Contrat-service démarré sur http://localhost:${process.env.PORT ?? 3000}`);
    logger.log(`🔌 Microservice RabbitMQ connecté à ${process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'}`);
    logger.log(`📚 Swagger dispo sur http://localhost:${process.env.PORT ?? 3000}/api/docs`);
    logger.log(`🔍 Monitoring Sentry activé (environnement: ${process.env.NODE_ENV || 'development'})`);
  } catch (error) {
    Sentry.captureException(error);
    logger.error(`❌ Erreur au démarrage du service: ${error.message}`);
    throw error;
  }
}
bootstrap();
