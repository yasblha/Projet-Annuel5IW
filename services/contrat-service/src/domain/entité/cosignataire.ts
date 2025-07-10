export type CosignataireType = 'UTILISATEUR' | 'ENTREPRISE';
export type CosignataireRole = 'PRINCIPAL' | 'SECONDARY';
export type CosignataireStatut = 'ENVOYE' | 'ACCEPTE' | 'REFUSE';

export class Cosignataire {
  constructor(
    public id: string,
    public contratId: string,
    public cosignataireId: string,
    public typeCosignataire: CosignataireType,
    public roleType: CosignataireRole,
    public pourcentageParts: number | null,
    public statutInvitation: CosignataireStatut,
    public dateInvitation: Date,
    public dateReponse: Date | null,
    public signatureElectronique: boolean,
    public signatureDate: Date | null,
    public emailCosignataire: string | null,
    public telephoneCosignataire: string | null,
    public dateCreation: Date,
    public dateMaj: Date,
    public createdBy: string | null,
    public updatedBy: string | null,
    public tenantId: string | null
  ) {}

  // === MÉTHODES MÉTIER ===

  /**
   * Vérifie si le cosignataire a signé
   */
  hasSigned(): boolean {
    return this.signatureElectronique && this.signatureDate !== null;
  }

  /**
   * Vérifie si l'invitation a été acceptée
   */
  isAccepted(): boolean {
    return this.statutInvitation === 'ACCEPTE';
  }

  /**
   * Vérifie si l'invitation a été refusée
   */
  isRefused(): boolean {
    return this.statutInvitation === 'REFUSE';
  }

  /**
   * Vérifie si l'invitation est en attente
   */
  isPending(): boolean {
    return this.statutInvitation === 'ENVOYE';
  }

  /**
   * Vérifie si c'est un cosignataire principal
   */
  isPrincipal(): boolean {
    return this.roleType === 'PRINCIPAL';
  }

  /**
   * Vérifie si c'est un cosignataire secondaire
   */
  isSecondary(): boolean {
    return this.roleType === 'SECONDARY';
  }

  /**
   * Vérifie si c'est un utilisateur
   */
  isUser(): boolean {
    return this.typeCosignataire === 'UTILISATEUR';
  }

  /**
   * Vérifie si c'est une entreprise
   */
  isEntreprise(): boolean {
    return this.typeCosignataire === 'ENTREPRISE';
  }

  /**
   * Calcule le temps écoulé depuis l'invitation
   */
  getTempsDepuisInvitation(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.dateInvitation.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // en jours
  }

  /**
   * Vérifie si l'invitation a expiré (plus de 30 jours)
   */
  isInvitationExpired(): boolean {
    return this.getTempsDepuisInvitation() > 30;
  }

  /**
   * Vérifie si l'invitation est récente (moins de 7 jours)
   */
  isInvitationRecent(): boolean {
    return this.getTempsDepuisInvitation() < 7;
  }

  /**
   * Obtient le statut de l'invitation
   */
  getInvitationStatus(): 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'EXPIRED' {
    if (this.isInvitationExpired()) return 'EXPIRED';
    if (this.isAccepted()) return 'ACCEPTED';
    if (this.isRefused()) return 'REFUSED';
    return 'PENDING';
  }

  /**
   * Vérifie si le cosignataire peut signer
   */
  canSign(): boolean {
    return this.isAccepted() && !this.hasSigned() && !this.isInvitationExpired();
  }

  /**
   * Obtient le pourcentage formaté
   */
  getPourcentageFormatted(): string {
    if (this.pourcentageParts === null) return 'Non défini';
    return `${this.pourcentageParts}%`;
  }

  /**
   * Obtient le type de cosignataire formaté
   */
  getTypeFormatted(): string {
    return this.isUser() ? 'Utilisateur' : 'Entreprise';
  }

  /**
   * Obtient le rôle formaté
   */
  getRoleFormatted(): string {
    return this.isPrincipal() ? 'Principal' : 'Secondaire';
  }
} 