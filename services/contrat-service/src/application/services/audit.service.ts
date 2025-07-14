import { Injectable } from '@nestjs/common';
import { ContratAuditRepository } from '@Database/repositories/contrat.repository';

export type AuditAction = 
  | 'CREATION' | 'MODIFICATION' | 'SIGNATURE' | 'RESILIATION' | 'SUSPENSION' 
  | 'RENOUVELLEMENT' | 'ASSOCIATION_COMPTEUR' | 'DISSOCIATION_COMPTEUR'
  | 'ASSOCIATION_ABONNEMENT' | 'DISSOCIATION_ABONNEMENT' | 'ASSOCIATION_CLIENT'
  | 'DISSOCIATION_CLIENT' | 'AJOUT_COSIGNATAIRE' | 'SUPPRESSION_COSIGNATAIRE'
  | 'SIGNATURE_COSIGNATAIRE' | 'INTERVENTION_CREEE' | 'INTERVENTION_TERMINEE'
  | 'ACTIVATION' | 'FINALISATION' | 'CREATION_BROUILLON' | 'ASSIGNATION_COMPTEUR' | 'MODIFICATION_COSIGNATAIRE';

export interface AuditDetails {
  anciennesValeurs?: any;
  nouvellesValeurs?: any;
  [key: string]: any;
}

export interface AuditEntry {
  contratId: string;
  userId?: string;
  action: AuditAction;
  details?: AuditDetails;
  commentaire?: string;
  ipAddress?: string;
  userAgent?: string;
  tenantId?: string;
}

@Injectable()
export class AuditService {
  private readonly auditRepository = new ContratAuditRepository();

  async logAction(entry: AuditEntry): Promise<void> {
    try {
      await this.auditRepository.create({
        contratId: entry.contratId,
        userId: entry.userId,
        action: entry.action,
        details: entry.details ? JSON.stringify(entry.details) : null,
        commentaire: entry.commentaire,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        tenantId: entry.tenantId,
        dateAction: new Date(),
        createdBy: entry.userId,
        updatedBy: entry.userId
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
      // Ne pas faire échouer l'opération principale si l'audit échoue
    }
  }

  async getAuditTrail(contratId: string, options?: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    dateDebut?: Date;
    dateFin?: Date;
  }): Promise<any[]> {
    return this.auditRepository.findByContratId(contratId, options);
  }

} 