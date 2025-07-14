export type CompteurActionType = 'ASSOCIATION' | 'DISSOCIATION' | 'REMPLACEMENT';

export class ContratCompteurHistorique {
  constructor(
    public id: string,
    public contratId: string,
    public compteurId: string,
    public interventionId: string | null,
    public typeAction: CompteurActionType,
    public dateDebut: Date,
    public dateFin: Date | null,
    public motif: string | null,
    public commentaire: string | null,
    public tenantId: string | null,
    public createdBy: string | null,
    public updatedBy: string | null,
    public dateCreation: Date,
    public dateMaj: Date
  ) {}

  /**
   * Vérifie si l'association est actuellement active
   */
  isActive(): boolean {
    return this.dateFin === null;
  }

  /**
   * Vérifie si l'association est terminée
   */
  isTerminated(): boolean {
    return this.dateFin !== null;
  }

  /**
   * Calcule la durée de l'association en jours
   */
  getDureeEnJours(): number {
    const endDate = this.dateFin || new Date();
    const diffTime = endDate.getTime() - this.dateDebut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifie si l'association est récente (moins de 7 jours)
   */
  isRecent(): boolean {
    const now = new Date();
    const diffDays = (now.getTime() - this.dateDebut.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 7;
  }

  /**
   * Vérifie si c'est une association
   */
  isAssociation(): boolean {
    return this.typeAction === 'ASSOCIATION';
  }

  /**
   * Vérifie si c'est une dissociation
   */
  isDissociation(): boolean {
    return this.typeAction === 'DISSOCIATION';
  }

  /**
   * Vérifie si c'est un remplacement
   */
  isRemplacement(): boolean {
    return this.typeAction === 'REMPLACEMENT';
  }

  /**
   * Obtient un résumé de l'action
   */
  getActionSummary(): string {
    const actionLabels: Record<CompteurActionType, string> = {
      'ASSOCIATION': 'Association du compteur',
      'DISSOCIATION': 'Dissociation du compteur',
      'REMPLACEMENT': 'Remplacement du compteur'
    };

    return actionLabels[this.typeAction];
  }

  /**
   * Obtient la durée formatée
   */
  getDureeFormatted(): string {
    const jours = this.getDureeEnJours();
    if (jours === 0) return 'Moins d\'un jour';
    if (jours === 1) return '1 jour';
    return `${jours} jours`;
  }

  /**
   * Vérifie si l'association a une intervention liée
   */
  hasIntervention(): boolean {
    return this.interventionId !== null;
  }

  /**
   * Obtient le statut de l'association
   */
  getStatus(): 'ACTIVE' | 'TERMINATED' | 'RECENT' {
    if (this.isActive()) {
      return this.isRecent() ? 'RECENT' : 'ACTIVE';
    }
    return 'TERMINATED';
  }
} 