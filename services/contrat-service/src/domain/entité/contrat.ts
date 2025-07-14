export class Contrat {
  constructor(
    public id: string,
    public proprietaireId: string,
    public typeProprietaire: 'UTILISATEUR' | 'ENTREPRISE',
    public numero: string,
    public dateDebut: Date,
    public dateFin: Date | null,
    public statut: 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'ANNULE' | 'TERMINE' | 'RESILIE',
    public dateCreation: Date,
    public dateMaj: Date,
    public objet: string | null,
    public montantTotal: number | null,
    public dateSignature: Date | null,
    public dateResiliation: Date | null,
    public motifResiliation: string | null,
    public statutSignature: 'EN_ATTENTE' | 'SIGNE' | 'REFUSE',
    public tenantId: string | null,
    public createdBy: string | null,
    public updatedBy: string | null,
    public compteurId: string | null = null,
    public abonnementId: string | null = null,
    public clientId: string | null = null
  ) {}

  // === MÉTHODES MÉTIER ===

  /**
   * Vérifie si le contrat peut être signé
   */
  canBeSigned(): boolean {
    return this.statut === 'ACTIF' && this.statutSignature === 'EN_ATTENTE';
  }

  /**
   * Vérifie si le contrat peut être résilié
   */
  canBeResilier(): boolean {
    return this.statut === 'ACTIF';
  }

  /**
   * Vérifie si le contrat peut être suspendu
   */
  canBeSuspendu(): boolean {
    return this.statut === 'ACTIF';
  }

  /**
   * Vérifie si le contrat peut être renouvelé
   */
  canBeRenouveler(): boolean {
    return this.statut === 'ACTIF' || this.statut === 'TERMINE';
  }

  /**
   * Vérifie si le contrat a un compteur associé
   */
  hasCompteur(): boolean {
    return this.compteurId !== null;
  }

  /**
   * Vérifie si le contrat a un abonnement associé
   */
  hasAbonnement(): boolean {
    return this.abonnementId !== null;
  }

  /**
   * Vérifie si le contrat est actif
   */
  isActif(): boolean {
    return this.statut === 'ACTIF';
  }

  /**
   * Vérifie si le contrat est signé
   */
  isSigned(): boolean {
    return this.statutSignature === 'SIGNE';
  }

  /**
   * Vérifie si le contrat est résilié
   */
  isResilier(): boolean {
    return this.statut === 'RESILIE';
  }

  /**
   * Vérifie si le contrat est suspendu
   */
  isSuspendu(): boolean {
    return this.statut === 'SUSPENDU';
  }

  /**
   * Calcule la durée du contrat en jours
   */
  getDureeEnJours(): number {
    if (!this.dateFin) return 0;
    const diffTime = this.dateFin.getTime() - this.dateDebut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifie si le contrat est expiré
   */
  isExpire(): boolean {
    if (!this.dateFin) return false;
    return new Date() > this.dateFin;
  }

  /**
   * Vérifie si le contrat est en cours
   */
  isEnCours(): boolean {
    const now = new Date();
    return now >= this.dateDebut && (!this.dateFin || now <= this.dateFin);
  }

  /**
   * Vérifie si le contrat peut être modifié
   */
  canBeModified(): boolean {
    return this.statut === 'ACTIF' || this.statut === 'EN_ATTENTE';
  }

  /**
   * Vérifie si le contrat peut être supprimé
   */
  canBeDeleted(): boolean {
    return this.statut === 'EN_ATTENTE' || this.statut === 'ANNULE';
  }
}