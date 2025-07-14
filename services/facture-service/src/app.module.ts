import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { FactureController } from './application/controllers/facture.controller';
import { LotFacturationController } from './application/controllers/lot-facturation.controller';
import { RapportsController } from './application/controllers/rapports.controller';
import { FactureMessageController } from './application/controllers/facture-message.controller';

// Services
import { FactureService } from './application/services/facture.service';
import { LotFacturationService } from './application/services/lot-facturation.service';
import { MultiTenantService } from './application/services/multi-tenant.service';
import { AuditService } from './application/services/audit.service';
import { InterServiceService } from './application/services/inter-service.service';
import { PdfGeneratorService } from './application/services/pdf-generator.service';

// Repository Adapters
import { FactureRepositoryAdapter } from './infrastructure/repositories/facture.repository.adapter';
import { LigneFactureRepositoryAdapter } from './infrastructure/repositories/ligne-facture.repository.adapter';
import { PaiementRepositoryAdapter } from './infrastructure/repositories/paiement.repository.adapter';
import { LotFacturationRepositoryAdapter } from './infrastructure/repositories/lot-facturation.repository.adapter';

// Messaging
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq.module';

// Database
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    RabbitMQModule,
    DatabaseModule, 
  ],
  controllers: [
    FactureController,
    LotFacturationController,
    RapportsController,
    FactureMessageController,
  ],
  providers: [
    // Services
    FactureService,
    LotFacturationService,
    MultiTenantService,
    AuditService,
    InterServiceService,
    PdfGeneratorService,
    
    // Repository Adapters
    FactureRepositoryAdapter,
    LigneFactureRepositoryAdapter,
    PaiementRepositoryAdapter,
    LotFacturationRepositoryAdapter,
  ],
})
export class AppModule {}
