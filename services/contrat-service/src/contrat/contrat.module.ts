import { Module } from '@nestjs/common';
import { ContratController } from './contrat.controller';
import { ContratService } from '@application/services/contrat.service';
import { AuditService } from '@application/services/audit.service';
import { InterServiceService } from '@application/services/inter-service.service';
import { MultiTenantService } from '@application/services/multi-tenant.service';
import { NotificationService } from '@application/services/notification.service';
import { WorkflowService } from '@application/services/workflow.service';
import { NumberGenerator } from '@application/services/number-generator.service';
import { CreateContratUseCase } from '@application/usecases/create-contrat.usecase';
import { ContratValidator } from '@application/validators/contrat.validator';

@Module({
  controllers: [ContratController],
  providers: [
    // Services principaux
    ContratService,
    AuditService,
    InterServiceService,
    MultiTenantService,
    NotificationService,
    WorkflowService,
    NumberGenerator,
    ContratValidator,
    
    // Use cases
    CreateContratUseCase,
    
    // Validators
    {
      provide: 'ContratValidator',
      useClass: require('@application/validators/contrat.validator').ContratValidator
    },
    
    // Mappers
    {
      provide: 'ContratMapper',
      useClass: require('@application/mappers/contrat.mapper').ContratMapper
    }
  ],
  exports: [
    ContratService,
    AuditService,
    InterServiceService,
    MultiTenantService,
    NotificationService,
    WorkflowService,
    NumberGenerator,
    CreateContratUseCase
  ]
})
export class ContratModule {} 