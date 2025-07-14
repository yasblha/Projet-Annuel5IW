import { Module } from '@nestjs/common';
import { ContratController } from './contrat.controller';
import { ContratService } from '@application/services/contrat.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ContratMicroservice } from './contrat.microservice';
import { ContratQueryService } from '@application/services/contrat-query.service';
import { ContratCommandService } from '@application/services/contrat-command.service';
import { AuditService } from '@application/services/audit.service';
import { InterServiceService } from '@application/services/inter-service.service';
import { NumberGenerator } from '@application/services/number-generator.service';
import { ContratValidator } from '@application/validators/contrat.validator';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ContratCompteurHistoriqueRepository } from '@Database/repositories/contratCompteurHistorique.repository';
import { ContratAuditRepository } from '@Database/repositories/contratAudit.repository';
import { InterventionRepository } from '@Database/repositories/intervention.repository';
import { AbonnementRepository } from '@Database/repositories/abonnement.repository';
import { CompteurService } from '@application/services/compteur.service';
import { NotificationService } from '@application/services/notification.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default_secret_key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ContratController, ContratMicroservice],
  providers: [
    ContratService,
    ContratQueryService,
    ContratCommandService,
    AuditService,
    InterServiceService,
    NumberGenerator,
    ContratValidator,
    ContratCompteurHistoriqueRepository,
    ContratAuditRepository,
    InterventionRepository,
    AbonnementRepository,
    CompteurService,
    NotificationService,
  ],
  exports: [
    ContratQueryService,
    ContratCommandService,
    AuditService,
    InterServiceService,
    NumberGenerator,
    ContratValidator,
    NotificationService,
  ],
})
export class ContratModule {}