import { Injectable } from '@nestjs/common';
import { sequelize } from '@Database/sequelize';
import { ContratRepository } from '@Database/repositories/contrat.repository';
import { CompteurRepository } from '@Database/repositories/compteur.repository';
import { CosignataireRepository } from '@Database/repositories/contrat.repository';
import { NumberGenerator } from '../services/number-generator.service';
import { AuditService } from '../services/audit.service';
import { InterServiceService } from '../services/inter-service.service';
import { EventBus } from '../../infrastructure/events/event-bus';

export class DomainError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

@Injectable()
export class FinalizeContratUseCase {
  constructor(
    private readonly contratRepo: ContratRepository,
    private readonly compteurRepo: CompteurRepository,
    private readonly cosignataireRepo: CosignataireRepository,
    private readonly numberGen: NumberGenerator,
    private readonly auditService: AuditService,
    private readonly interServiceService: InterServiceService,
    private readonly eventBus: EventBus
  ) {}

  async execute(contratId: string, context: { userId?: string; tenantId: string; ipAddress?: string; userAgent?: string }): Promise<void> {
    await sequelize.transaction(async (tx) => {
      // 1. Charger le contrat
      const contrat = await this.contratRepo.findById(contratId, context.tenantId, { transaction: tx });
      if (!contrat) throw new DomainError('CONTRAT_INTROUVABLE', 'Contrat introuvable');

      // 2. Vérifier le statut
      if (!['EN_ATTENTE', 'BROUILLON'].includes(contrat.statut)) {
        throw new DomainError('CONTRAT_DEJA_ACTIVE', 'Le contrat ne peut pas être finalisé dans son état actuel');
      }

      // 3. Vérifier qu'au moins 1 compteur actif est lié
      const hasActiveMeter = await this.compteurRepo.hasActiveMeter(contratId, { transaction: tx });
      if (!hasActiveMeter) {
        throw new DomainError('COMPTEUR_OBLIGATOIRE', 'Au moins un compteur actif est requis');
      }

      // 4. Vérifier que tous les cosignataires ont signé
      const allSigned = await this.cosignataireRepo.allCosignatairesSigned(contratId, { transaction: tx });
      if (!allSigned) {
        throw new DomainError('SIGNATURES_INCOMPLETES', 'Tous les cosignataires doivent signer');
      }

      // 5. Générer le numéro de contrat si besoin
      let numero = contrat.numero;
      if (!numero) {
        numero = await this.numberGen.nextContractNumber(contrat.typeContrat, contrat.zone);
      }

      // 6. Activer le contrat
      await this.contratRepo.activate(contratId, numero, { transaction: tx });

      // 7. Audit trail
      await this.auditService.logAction({
        contratId,
        userId: context.userId,
        action: 'ACTIVATION',
        details: { numero },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        tenantId: context.tenantId
      });

      // 8. Publier l'événement
      await this.eventBus.publish('contract.activated', { contratId, numero });

      // 9. Créer l'intervention via operation-service
      await this.interServiceService.createIntervention({
        type: 'ACTIVATION_CONTRAT',
        contratId,
        compteurId: contrat.compteurId,
        description: `Activation du contrat ${numero}`,
        datePlanifiee: new Date(),
        priorite: 'NORMALE',
        tenantId: context.tenantId,
        createdBy: context.userId
      });
    });
  }
} 