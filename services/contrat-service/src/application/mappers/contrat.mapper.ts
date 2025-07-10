import { ContratResponseDto } from '../dtos/contrat-response.dto';
import { Contrat } from '@domain/entité/contrat';
import { ContratAudit } from '@domain/entité/contratAudit';
import { ContratCompteurHistorique } from '@domain/entité/contratCompteurHistorique';
import { Cosignataire } from '@domain/entité/cosignataire';

export class ContratMapper {
  
  // === MAPPING VERS RÉPONSE ===
  static toResponse(model: any): ContratResponseDto {
    if (!model) return null;

    return {
      id: model.id,
      numero: model.numero,
      proprietaireId: model.proprietaireId,
      typeProprietaire: model.typeProprietaire,
      dateDebut: model.dateDebut,
      dateFin: model.dateFin,
      statut: model.statut,
      statutSignature: model.statutSignature,
      objet: model.objet,
      montantTotal: model.montantTotal,
      dateSignature: model.dateSignature,
      dateResiliation: model.dateResiliation,
      motifResiliation: model.motifResiliation,
      compteurId: model.compteurId,
      abonnementId: model.abonnementId,
      clientId: model.clientId,
      tenantId: model.tenantId,
      createdBy: model.createdBy,
      updatedBy: model.updatedBy,
      dateCreation: model.dateCreation,
      dateMaj: model.dateMaj,
      // Calculs dérivés
      dureeEnJours: this.calculateDureeEnJours(model.dateDebut, model.dateFin),
      isActif: model.statut === 'ACTIF',
      isSigned: model.statutSignature === 'SIGNE',
      isExpire: this.isExpire(model.dateFin),
      isEnCours: this.isEnCours(model.dateDebut, model.dateFin)
    };
  }

  // === MAPPING VERS ENTITÉ MÉTIER ===
  static toEntity(model: any): Contrat {
    if (!model) return null;

    return new Contrat(
      model.id,
      model.proprietaireId,
      model.typeProprietaire,
      model.numero,
      new Date(model.dateDebut),
      model.dateFin ? new Date(model.dateFin) : null,
      model.statut,
      new Date(model.dateCreation),
      new Date(model.dateMaj),
      model.objet,
      model.montantTotal,
      model.dateSignature ? new Date(model.dateSignature) : null,
      model.dateResiliation ? new Date(model.dateResiliation) : null,
      model.motifResiliation,
      model.statutSignature,
      model.tenantId,
      model.createdBy,
      model.updatedBy,
      model.compteurId,
      model.abonnementId,
      model.clientId
    );
  }

  // === MAPPING VERS MODÈLE ===
  static toModel(entity: Contrat): any {
    if (!entity) return null;

    return {
      id: entity.id,
      numero: entity.numero,
      proprietaireId: entity.proprietaireId,
      typeProprietaire: entity.typeProprietaire,
      dateDebut: entity.dateDebut,
      dateFin: entity.dateFin,
      statut: entity.statut,
      statutSignature: entity.statutSignature,
      objet: entity.objet,
      montantTotal: entity.montantTotal,
      dateSignature: entity.dateSignature,
      dateResiliation: entity.dateResiliation,
      motifResiliation: entity.motifResiliation,
      compteurId: entity.compteurId,
      abonnementId: entity.abonnementId,
      clientId: entity.clientId,
      tenantId: entity.tenantId,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      dateCreation: entity.dateCreation,
      dateMaj: entity.dateMaj
    };
  }

  // === MAPPING AUDIT ===
  static toAuditResponse(auditModel: any): any {
    if (!auditModel) return null;

    return {
      id: auditModel.id,
      contratId: auditModel.contratId,
      userId: auditModel.userId,
      action: auditModel.action,
      details: auditModel.details ? JSON.parse(auditModel.details) : null,
      commentaire: auditModel.commentaire,
      ipAddress: auditModel.ipAddress,
      userAgent: auditModel.userAgent,
      dateAction: auditModel.dateAction,
      tenantId: auditModel.tenantId,
      createdBy: auditModel.createdBy,
      updatedBy: auditModel.updatedBy,
      // Calculs dérivés
      isRecent: this.isRecent(auditModel.dateAction),
      actionSummary: this.getActionSummary(auditModel.action)
    };
  }

  // === MAPPING HISTORIQUE COMPTEUR ===
  static toCompteurHistoriqueResponse(historiqueModel: any): any {
    if (!historiqueModel) return null;

    return {
      id: historiqueModel.id,
      contratId: historiqueModel.contratId,
      compteurId: historiqueModel.compteurId,
      interventionId: historiqueModel.interventionId,
      typeAction: historiqueModel.typeAction,
      dateDebut: historiqueModel.dateDebut,
      dateFin: historiqueModel.dateFin,
      motif: historiqueModel.motif,
      commentaire: historiqueModel.commentaire,
      tenantId: historiqueModel.tenantId,
      createdBy: historiqueModel.createdBy,
      updatedBy: historiqueModel.updatedBy,
      dateCreation: historiqueModel.dateCreation,
      dateMaj: historiqueModel.dateMaj,
      // Calculs dérivés
      isActive: historiqueModel.dateFin === null,
      dureeEnJours: this.calculateDureeEnJours(historiqueModel.dateDebut, historiqueModel.dateFin),
      isRecent: this.isRecent(historiqueModel.dateDebut),
      status: this.getCompteurStatus(historiqueModel.dateFin)
    };
  }

  // === MAPPING COSIGNATAIRE ===
  static toCosignataireResponse(cosignataireModel: any): any {
    if (!cosignataireModel) return null;

    return {
      id: cosignataireModel.id,
      contratId: cosignataireModel.contratId,
      cosignataireId: cosignataireModel.cosignataireId,
      typeCosignataire: cosignataireModel.typeCosignataire,
      roleType: cosignataireModel.roleType,
      pourcentageParts: cosignataireModel.pourcentageParts,
      statutInvitation: cosignataireModel.statutInvitation,
      dateInvitation: cosignataireModel.dateInvitation,
      dateReponse: cosignataireModel.dateReponse,
      signatureElectronique: cosignataireModel.signatureElectronique,
      signatureDate: cosignataireModel.signatureDate,
      emailCosignataire: cosignataireModel.emailCosignataire,
      telephoneCosignataire: cosignataireModel.telephoneCosignataire,
      dateCreation: cosignataireModel.dateCreation,
      dateMaj: cosignataireModel.dateMaj,
      createdBy: cosignataireModel.createdBy,
      updatedBy: cosignataireModel.updatedBy,
      tenantId: cosignataireModel.tenantId,
      // Calculs dérivés
      hasSigned: cosignataireModel.signatureElectronique && cosignataireModel.signatureDate,
      isAccepted: cosignataireModel.statutInvitation === 'ACCEPTE',
      isPending: cosignataireModel.statutInvitation === 'ENVOYE',
      isPrincipal: cosignataireModel.roleType === 'PRINCIPAL',
      tempsDepuisInvitation: this.calculateTempsDepuisInvitation(cosignataireModel.dateInvitation),
      invitationStatus: this.getInvitationStatus(cosignataireModel.statutInvitation, cosignataireModel.dateInvitation)
    };
  }

  // === MAPPING LISTE ===
  static toResponseList(models: any[]): ContratResponseDto[] {
    if (!models || !Array.isArray(models)) return [];
    return models.map(model => this.toResponse(model)).filter(Boolean);
  }

  static toAuditResponseList(auditModels: any[]): any[] {
    if (!auditModels || !Array.isArray(auditModels)) return [];
    return auditModels.map(model => this.toAuditResponse(model)).filter(Boolean);
  }

  static toCompteurHistoriqueResponseList(historiqueModels: any[]): any[] {
    if (!historiqueModels || !Array.isArray(historiqueModels)) return [];
    return historiqueModels.map(model => this.toCompteurHistoriqueResponse(model)).filter(Boolean);
  }

  static toCosignataireResponseList(cosignataireModels: any[]): any[] {
    if (!cosignataireModels || !Array.isArray(cosignataireModels)) return [];
    return cosignataireModels.map(model => this.toCosignataireResponse(model)).filter(Boolean);
  }

  // === UTILITAIRES DE CALCUL ===
  private static calculateDureeEnJours(dateDebut: Date | string, dateFin: Date | string | null): number {
    if (!dateDebut) return 0;
    
    const debut = new Date(dateDebut);
    const fin = dateFin ? new Date(dateFin) : new Date();
    
    const diffTime = fin.getTime() - debut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static isExpire(dateFin: Date | string | null): boolean {
    if (!dateFin) return false;
    return new Date() > new Date(dateFin);
  }

  private static isEnCours(dateDebut: Date | string, dateFin: Date | string | null): boolean {
    const now = new Date();
    const debut = new Date(dateDebut);
    const fin = dateFin ? new Date(dateFin) : null;
    
    return now >= debut && (!fin || now <= fin);
  }

  private static isRecent(date: Date | string): boolean {
    const dateObj = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  private static calculateTempsDepuisInvitation(dateInvitation: Date | string): number {
    const invitation = new Date(dateInvitation);
    const now = new Date();
    const diffTime = now.getTime() - invitation.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // en jours
  }

  private static getActionSummary(action: string): string {
    const actionLabels: Record<string, string> = {
      'CREATION': 'Création du contrat',
      'MODIFICATION': 'Modification du contrat',
      'SIGNATURE': 'Signature du contrat',
      'RESILIATION': 'Résiliation du contrat',
      'SUSPENSION': 'Suspension du contrat',
      'RENOUVELLEMENT': 'Renouvellement du contrat',
      'ASSOCIATION_COMPTEUR': 'Association d\'un compteur',
      'DISSOCIATION_COMPTEUR': 'Dissociation d\'un compteur',
      'ASSOCIATION_ABONNEMENT': 'Association d\'un abonnement',
      'DISSOCIATION_ABONNEMENT': 'Dissociation d\'un abonnement',
      'AJOUT_COSIGNATAIRE': 'Ajout d\'un cosignataire',
      'SUPPRESSION_COSIGNATAIRE': 'Suppression d\'un cosignataire',
      'SIGNATURE_COSIGNATAIRE': 'Signature d\'un cosignataire'
    };

    return actionLabels[action] || action;
  }

  private static getCompteurStatus(dateFin: Date | string | null): 'ACTIVE' | 'TERMINATED' | 'RECENT' {
    if (dateFin === null) {
      return this.isRecent(new Date()) ? 'RECENT' : 'ACTIVE';
    }
    return 'TERMINATED';
  }

  private static getInvitationStatus(statutInvitation: string, dateInvitation: Date | string): 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'EXPIRED' {
    if (statutInvitation === 'ACCEPTE') return 'ACCEPTED';
    if (statutInvitation === 'REFUSE') return 'REFUSED';
    
    const tempsDepuisInvitation = this.calculateTempsDepuisInvitation(dateInvitation);
    if (tempsDepuisInvitation > 30) return 'EXPIRED';
    
    return 'PENDING';
  }
} 