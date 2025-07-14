import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// Ajout de la déclaration de type pour Express
declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
      tenantId?: string;
    }
  }
}

// 🗄️ Initialisation de la base de données
import { initDatabase } from '@Database/sequelize';

async function bootstrap() {
  // Avant toute chose, on initialise la connexion et les modèles Sequelize
  await initDatabase();

  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Configuration de la validation globale
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API Facture-Service')
    .setDescription('API pour la gestion des factures, paiements et lots de facturation')
    .setVersion('1.0')
    .addTag('factures')
    .addTag('paiements')
    .addTag('lots-facturation')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Préfixe API pour les routes HTTP
  app.setGlobalPrefix('api');
  
  // Configuration microservice pour RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
      queue: 'facture_queue',
      queueOptions: { durable: true },
    },
  });

  // Démarrer à la fois l'API HTTP et le microservice
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
  
  console.log(`✅ Facture-service démarré sur http://localhost:${process.env.PORT || 3000}`);
  console.log(`🔌 Microservice RabbitMQ connecté à ${process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'}`);
  console.log(`📚 Swagger disponible sur http://localhost:${process.env.PORT || 3000}/api/docs`);
}

bootstrap();
