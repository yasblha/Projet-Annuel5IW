export type AuditAction = 
  | 'CREATION' | 'MODIFICATION' | 'SIGNATURE' | 'RESILIATION' | 'SUSPENSION' 
  | 'RENOUVELLEMENT' | 'ASSOCIATION_COMPTEUR' | 'DISSOCIATION_COMPTEUR'
  | 'ASSOCIATION_ABONNEMENT' | 'DISSOCIATION_ABONNEMENT' | 'ASSOCIATION_CLIENT'
  | 'DISSOCIATION_CLIENT' | 'AJOUT_COSIGNATAIRE' | 'SUPPRESSION_COSIGNATAIRE'
  | 'SIGNATURE_COSIGNATAIRE' | 'INTERVENTION_CREEE' | 'INTERVENTION_TERMINEE';

export interface AuditDetails {
  anciennesValeurs?: any;
  nouvellesValeurs?: any;
  [key: string]: any;
}

export class ContratAudit {
  constructor(
    public id: string,
    public contratId: string,
    public userId: string | null,
    public action: AuditAction,
    public details: string | null, // JSON stringifié
    public commentaire: string | null,
    public ipAddress: string | null,
    public userAgent: string | null,
    public dateAction: Date,
    public tenantId: string | null,
    public createdBy: string | null,
    public updatedBy: string | null
  ) {}

  /**
   * Parse les détails JSON en objet
   */
  getDetails(): AuditDetails | null {
    if (!this.details) return null;
    try {
      return JSON.parse(this.details);
    } catch (error) {
      console.error('Erreur lors du parsing des détails d\'audit:', error);
      return null;
    }
  }

  /**
   * Vérifie si l'action est une modification
   */
  isModification(): boolean {
    return this.action === 'MODIFICATION';
  }

  /**
   * Vérifie si l'action est une signature
   */
  isSignature(): boolean {
    return this.action === 'SIGNATURE' || this.action === 'SIGNATURE_COSIGNATAIRE';
  }

  /**
   * Vérifie si l'action concerne un compteur
   */
  isCompteurAction(): boolean {
    return this.action === 'ASSOCIATION_COMPTEUR' || this.action === 'DISSOCIATION_COMPTEUR';
  }

  /**
   * Vérifie si l'action concerne un abonnement
   */
  isAbonnementAction(): boolean {
    return this.action === 'ASSOCIATION_ABONNEMENT' || this.action === 'DISSOCIATION_ABONNEMENT';
  }

  /**
   * Vérifie si l'action concerne un cosignataire
   */
  isCosignataireAction(): boolean {
    return this.action === 'AJOUT_COSIGNATAIRE' || this.action === 'SUPPRESSION_COSIGNATAIRE' || this.action === 'SIGNATURE_COSIGNATAIRE';
  }

  /**
   * Vérifie si l'action est récente (moins de 24h)
   */
  isRecent(): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - this.dateAction.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  /**
   * Obtient un résumé de l'action
   */
  getActionSummary(): string {
    const actionLabels: Record<AuditAction, string> = {
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
      'ASSOCIATION_CLIENT': 'Association d\'un client',
      'DISSOCIATION_CLIENT': 'Dissociation d\'un client',
      'AJOUT_COSIGNATAIRE': 'Ajout d\'un cosignataire',
      'SUPPRESSION_COSIGNATAIRE': 'Suppression d\'un cosignataire',
      'SIGNATURE_COSIGNATAIRE': 'Signature d\'un cosignataire',
      'INTERVENTION_CREEE': 'Création d\'une intervention',
      'INTERVENTION_TERMINEE': 'Terminaison d\'une intervention'
    };

    return actionLabels[this.action] || this.action;
  }
} 