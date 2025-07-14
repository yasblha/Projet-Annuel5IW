import { Injectable } from '@nestjs/common';
import { CreateContratDto } from '../dtos/create-contrat.dto';
import { ContratResponseDto } from '../dtos/contrat-response.dto';
import { NumberGenerator } from '../services/number-generator.service';
import { ContratValidator, ValidationError } from '../validators/contrat.validator';
import { ContratCommandService } from '../services/contrat-command.service';
import { AuditService } from '../services/audit.service';
import { InterServiceService } from '../services/inter-service.service';
import { MultiTenantService } from '../services/multi-tenant.service';
import { NotificationService } from '../services/notification.service';
import { ContratError, ErrorHandler, BusinessErrorCodes } from '../errors/contrat.errors';
import { ContratMapper } from '../mappers/contrat.mapper';

export interface CreateContratContext {
  tenantId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateContratResult {
  success: boolean;
  contrat?: ContratResponseDto;
  error?: ContratError;
  auditTrail?: any[];
  notifications?: any[];
}

@Injectable()
export class CreateContratUseCase {
  constructor(
    private readonly commandService: ContratCommandService,
    private readonly numberGenerator: NumberGenerator,
    private readonly auditService: AuditService,
    private readonly interServiceService: InterServiceService,
    private readonly multiTenantService: MultiTenantService,
    private readonly notificationService: NotificationService
  ) {}

  async execute(dto: CreateContratDto, context: CreateContratContext): Promise<CreateContratResult> {
    try {
      // === ÉTAPE 1: VALIDATION MÉTIER ===
      this.validateBusinessRules(dto, context);

      // === ÉTAPE 2: VALIDATION INTER-SERVICES ===
      await this.validateInterServices(dto, context);

      // === ÉTAPE 3: GÉNÉRATION DU NUMÉRO ===
      const numero = await this.generateContractNumber(dto, context);

      // === ÉTAPE 4: PRÉPARATION DES DONNÉES ===
      const contratData = this.prepareContractData(dto, numero, context);

      // === ÉTAPE 5: CRÉATION DU CONTRAT ===
      const contrat = await this.createContract(contratData, context);

      // === ÉTAPE 6: CRÉATION DES COSIGNATAIRES ===
      const cosignataires = await this.createCosignataires(contrat.id, dto, context);

      // === ÉTAPE 7: LIAISON DES ENTITÉS ===
      await this.linkEntities(contrat.id, dto, context);

      // === ÉTAPE 8: AUDIT TRAIL ===
      const auditTrail = await this.createAuditTrail(contrat, dto, context);

      // === ÉTAPE 9: NOTIFICATIONS ===
      const notifications = await this.sendNotifications(contrat, cosignataires, context);

      // === ÉTAPE 10: RÉPONSE ===
      const response = ContratMapper.toResponse(contrat);

      return {
        success: true,
        contrat: response,
        auditTrail,
        notifications
      };

    } catch (error) {
      const contratError = ErrorHandler.handle(error);
      ErrorHandler.logError(contratError, { dto, context });
      
      return {
        success: false,
        error: contratError
      };
    }
  }

  // === VALIDATION MÉTIER ===
  private validateBusinessRules(dto: CreateContratDto, context: CreateContratContext): void {
    try {
      ContratValidator.validateCreate(dto);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ContratError(
          error.message,
          BusinessErrorCodes.CONTRAT_CREATION_FAILED,
          400,
          { field: error.field, code: error.code }
        );
      }
      throw error;
    }
  }

  // === VALIDATION INTER-SERVICES ===
  private async validateInterServices(dto: CreateContratDto, context: CreateContratContext): Promise<void> {
    try {
      const validation = await this.interServiceService.validateContratCreation({
        clientId: dto.proprietaireId,
        compteurId: dto.compteurId,
        abonnementId: dto.abonnementId,
      });

      if (!validation.isValid) {
        throw new ContratError(
          `Validation inter-services échouée: ${validation.errors.join(', ')}`,
          BusinessErrorCodes.CONTRAT_CREATION_FAILED,
          400,
          { validationErrors: validation.errors }
        );
      }
    } catch (error) {
      if (error instanceof ContratError) {
        throw error;
      }
      throw new ContratError(
        'Erreur lors de la validation inter-services',
        BusinessErrorCodes.CONTRAT_CREATION_FAILED,
        502,
        { originalError: error.message }
      );
    }
  }

  // === GÉNÉRATION DU NUMÉRO ===
  private async generateContractNumber(dto: CreateContratDto, context: CreateContratContext): Promise<string> {
    try {
      return await this.numberGenerator.nextContract(dto.zone);
    } catch (error) {
      throw new ContratError(
        'Erreur lors de la génération du numéro de contrat',
        BusinessErrorCodes.CONTRAT_CREATION_FAILED,
        500,
        { zone: dto.zone, originalError: error.message }
      );
    }
  }

  // === PRÉPARATION DES DONNÉES ===
  private prepareContractData(dto: CreateContratDto, numero: string, context: CreateContratContext): any {
    const contratData = {
      ...dto,
      numero,
      statut: 'EN_ATTENTE',
      statutSignature: 'EN_ATTENTE',
      dateCreation: new Date(),
      dateMaj: new Date(),
      createdBy: context.userId,
      updatedBy: context.userId
    };

    return this.multiTenantService.addTenantToData(contratData, context.tenantId);
  }

  // === CRÉATION DU CONTRAT ===
  private async createContract(contratData: any, context: CreateContratContext): Promise<any> {
    try {
      return await this.commandService.create(contratData, context);
    } catch (error) {
      throw new ContratError(
        'Erreur lors de la création du contrat en base de données',
        BusinessErrorCodes.CONTRAT_CREATION_FAILED,
        500,
        { contratData, originalError: error.message }
      );
    }
  }

  // === CRÉATION DES COSIGNATAIRES ===
  private async createCosignataires(contratId: string, dto: CreateContratDto, context: CreateContratContext): Promise<any[]> {
    const cosignataires = [];

    if (dto.cosignataires && dto.cosignataires.length > 0) {
      for (const cosignataireDto of dto.cosignataires) {
        try {
          const cosignataire = await this.commandService.createCosignataire(contratId, cosignataireDto, context);
          cosignataires.push(cosignataire);
        } catch (error) {
          throw new ContratError(
            'Erreur lors de la création des cosignataires',
            BusinessErrorCodes.COSIGNATAIRE_CREATION_FAILED,
            500,
            { cosignataireDto, originalError: error.message }
          );
        }
      }
    }

    return cosignataires;
  }

  // === LIAISON DES ENTITÉS ===
  private async linkEntities(contratId: string, dto: CreateContratDto, context: CreateContratContext): Promise<void> {
    try {
      // Liaison du compteur si fourni
      if (dto.compteurId) {
        await this.commandService.lierCompteur(contratId, { compteurId: dto.compteurId }, context);
      }

      // Liaison de l'abonnement si fourni
      if (dto.abonnementId) {
        await this.commandService.lierAbonnement(contratId, { abonnementId: dto.abonnementId }, context);
      }
    } catch (error) {
      throw new ContratError(
        'Erreur lors de la liaison des entités',
        BusinessErrorCodes.COMPTEUR_ASSOCIATION_FAILED,
        500,
        { contratId, dto, originalError: error.message }
      );
    }
  }

  // === CRÉATION AUDIT TRAIL ===
  private async createAuditTrail(contrat: any, dto: CreateContratDto, context: CreateContratContext): Promise<any[]> {
    try {
      await this.auditService.logAction({
        contratId: contrat.id,
        userId: context.userId,
        action: 'CREATION',
        details: {
          contratData: dto,
          numero: contrat.numero,
          proprietaireId: dto.proprietaireId,
          typeProprietaire: dto.typeProprietaire,
          zone: dto.zone,
          dateDebut: dto.dateDebut,
          cosignatairesCount: dto.cosignataires?.length || 0,
          compteurId: dto.compteurId,
          abonnementId: dto.abonnementId
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });

      return await this.auditService.getAuditTrail(contrat.id);
    } catch (error) {
      throw new ContratError(
        'Erreur lors de la création de l\'audit trail',
        BusinessErrorCodes.AUDIT_TRAIL_FAILED,
        500,
        { contratId: contrat.id, originalError: error.message }
      );
    }
  }

  // === ENVOI DES NOTIFICATIONS ===
  private async sendNotifications(contrat: any, cosignataires: any[], context: CreateContratContext): Promise<any[]> {
    const notifications = [];

    try {
      // Notification au propriétaire
      const proprietaireNotification = await this.notificationService.notifyContractCreation({
        contratId: contrat.id,
        numero: contrat.numero,
        proprietaireId: contrat.proprietaireId,
        typeProprietaire: contrat.typeProprietaire,
        tenantId: context.tenantId
      });
      notifications.push(proprietaireNotification);

      // Notifications aux cosignataires
      for (const cosignataire of cosignataires) {
        const cosignataireNotification = await this.notificationService.notifyCosignataireInvitation({
          contratId: contrat.id,
          cosignataireId: cosignataire.cosignataireId,
          email: cosignataire.emailCosignataire,
          tenantId: context.tenantId
        });
        notifications.push(cosignataireNotification);
      }

      return notifications;
    } catch (error) {
      throw new ContratError(
        'Erreur lors de l\'envoi des notifications',
        BusinessErrorCodes.NOTIFICATION_FAILED,
        500,
        { contratId: contrat.id, originalError: error.message }
      );
    }
  }
}