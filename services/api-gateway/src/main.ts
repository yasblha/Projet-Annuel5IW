import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  app.useGlobalPipes(new ValidationPipe());

  // Middleware de logging pour tracer toutes les requêtes
  app.use((req, res, next) => {
    console.log(` [API Gateway] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    console.log(` [API Gateway] Headers:`, {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin'],
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none'
    });
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(` [API Gateway] Body:`, JSON.stringify(req.body).substring(0, 200));
    }
    next();
  });

  // Active CORS pour le frontend
  app.enableCors({
    origin: [
      'https://app.aquaerp.cloud', // autorise le frontend en prod
      'http://localhost:3009',     // frontend local
      'http://localhost:8080',     // ancien frontend local
      'http://localhost:5173',     // Vite dev server
      'http://localhost:3000',     // API Gateway
      'http://127.0.0.1:3009',     // frontend local (alternative)
      'http://127.0.0.1:3000'      // API Gateway (alternative)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept',
      'X-Request-ID',
      'X-Retry-After-500'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Configuration Swagger - seulement en environnement de développement
  if (!isProduction) {
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
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API Gateway démarré sur le port ${process.env.PORT ?? 3000} en mode ${isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
  if (!isProduction) {
    console.log(`Documentation Swagger disponible sur http://localhost:${process.env.PORT ?? 3000}/api-docs`);
  }
}

bootstrap();