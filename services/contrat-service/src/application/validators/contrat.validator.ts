import { Injectable } from '@nestjs/common';
import { CreateContratDto } from '../dtos/create-contrat.dto';
import { CreateContratMetierDto } from '../dtos/create-contrat.dto';
import { CreateContratDraftDto } from '../dtos/create-contrat-draft.dto';
import { AssignCompteurDto } from '../dtos/assign-compteur.dto';
import { UpdateContratDto } from '../dtos/update-contrat.dto';
import { SignatureContratDto } from '../dtos/signature-contrat.dto';
import { ResiliationContratDto } from '../dtos/resiliation-contrat.dto';
import { SuspensionContratDto } from '../dtos/suspension-contrat.dto';
import { RenouvellementContratDto } from '../dtos/renouvellement-contrat.dto';
import { CreateCosignataireDto } from '../dtos/cosignataire.dto';
import { ContratRepository } from '@Database/repositories/contrat.repository';

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

@Injectable()
export class ContratValidator {
  
  // === VALIDATION CRÉATION ===
  static validateCreate(dto: CreateContratDto): void {
    const errors: string[] = [];

    // Validation des champs obligatoires
    // Le propriétaire n'est obligatoire qu'après sélection client
    if (!dto.typeProprietaire) {
      errors.push('Le type de propriétaire est obligatoire');
    } else if (!['UTILISATEUR', 'ENTREPRISE'].includes(dto.typeProprietaire)) {
      errors.push('Le type de propriétaire doit être UTILISATEUR ou ENTREPRISE');
    }

    if (!dto.zone) {
      errors.push('La zone est obligatoire');
    }

    if (!dto.dateDebut) {
      errors.push('La date de début est obligatoire');
    } else {
      const dateDebut = new Date(dto.dateDebut);
      const aujourdhui = new Date();
      
      // La date de début ne peut pas être dans le passé
      if (dateDebut < aujourdhui) {
        errors.push('La date de début ne peut pas être dans le passé');
      }

      // La date de début ne peut pas être plus de 2 ans dans le futur
      const deuxAns = new Date();
      deuxAns.setFullYear(deuxAns.getFullYear() + 2);
      if (dateDebut > deuxAns) {
        errors.push('La date de début ne peut pas être plus de 2 ans dans le futur');
      }
    }

    // Validation des cosignataires
    if (dto.cosignataires && dto.cosignataires.length > 0) {
      this.validateCosignataires(dto.cosignataires, errors);
    }

    if (errors.length > 0) {
      throw new ValidationError(`Erreurs de validation: ${errors.join(', ')}`, 'validation', 'VALIDATION_ERROR');
    }
  }

  // === VALIDATION CRÉATION AVEC FORMAT MÉTIER ===
  static validateCreateMetier(dto: CreateContratMetierDto): void {
    const errors: string[] = [];

    // Validation des champs obligatoires de base
    // Le propriétaire n'est obligatoire qu'après sélection client
    if (!dto.typeProprietaire) {
      errors.push('Le type de propriétaire est obligatoire');
    } else if (!['UTILISATEUR', 'ENTREPRISE'].includes(dto.typeProprietaire)) {
      errors.push('Le type de propriétaire doit être UTILISATEUR ou ENTREPRISE');
    }

    // Validation du type de contrat métier
    if (!dto.typeContrat) {
      errors.push('Le type de contrat est obligatoire');
    } else if (!['I', 'P', 'C', 'A'].includes(dto.typeContrat)) {
      errors.push('Le type de contrat doit être I (Individuel), P (Particulier), C (Collectivité) ou A (Administration)');
    }

    // Validation de la zone
    if (!dto.zone) {
      errors.push('La zone est obligatoire');
    } else {
      if (!/^[A-Za-z0-9_-]{2,10}$/.test(dto.zone)) {
        errors.push('La zone doit contenir uniquement des caractères alphanumériques, tirets ou underscore (2-10).');
      }
    }

    // Validation de la date de début
    if (!dto.dateDebut) {
      errors.push('La date de début est obligatoire');
    } else {
      const dateDebut = new Date(dto.dateDebut);
      const aujourdhui = new Date();
      
      // La date de début ne peut pas être dans le passé
      if (dateDebut < aujourdhui) {
        errors.push('La date de début ne peut pas être dans le passé');
      }

      // La date de début ne peut pas être plus de 2 ans dans le futur
      const deuxAns = new Date();
      deuxAns.setFullYear(deuxAns.getFullYear() + 2);
      if (dateDebut > deuxAns) {
        errors.push('La date de début ne peut pas être plus de 2 ans dans le futur');
      }
    }

    // Validation des règles métier spécifiques
    this.validateMetierBusinessRules(dto, errors);

    // Validation des cosignataires
    if (dto.cosignataires && dto.cosignataires.length > 0) {
      this.validateCosignataires(dto.cosignataires, errors);
    }

    if (errors.length > 0) {
      throw new ValidationError(`Erreurs de validation métier: ${errors.join(', ')}`, 'validation', 'VALIDATION_ERROR');
    }
  }

  // === VALIDATION CRÉATION BROUILLON ===
  static validateDraftCreation(dto: CreateContratDraftDto): void {
    const errors: string[] = [];

    // Validation des champs obligatoires
    // Le propriétaire n'est obligatoire qu'après sélection client
    if (!dto.typeProprietaire) {
      errors.push('Le type de propriétaire est obligatoire');
    } else if (!['UTILISATEUR', 'ENTREPRISE'].includes(dto.typeProprietaire)) {
      errors.push('Le type de propriétaire doit être UTILISATEUR ou ENTREPRISE');
    }

    if (!dto.zone) {
      errors.push('La zone est obligatoire');
    } else {
      if (!/^[A-Za-z0-9_-]{2,10}$/.test(dto.zone)) {
        errors.push('La zone doit contenir uniquement des caractères alphanumériques, tirets ou underscore (2-10).');
      }
    }

    if (!dto.typeContrat) {
      errors.push('Le type de contrat est obligatoire');
    } else if (!['I', 'P', 'C', 'A'].includes(dto.typeContrat)) {
      errors.push('Le type de contrat doit être I (Individuel), P (Particulier), C (Collectivité) ou A (Administration)');
    }

    if (!dto.dateDebut) {
      errors.push('La date de début est obligatoire');
    }

    // Validation des cosignataires
    if (dto.cosignataires && dto.cosignataires.length > 0) {
      this.validateCosignataires(dto.cosignataires, errors);
    }

    if (errors.length > 0) {
      throw new ValidationError(`Erreurs de validation brouillon: ${errors.join(', ')}`, 'validation', 'VALIDATION_ERROR');
    }
  }

  // === VALIDATION ASSIGNATION COMPTEUR ===
  static validateCompteurAssignment(dto: AssignCompteurDto): void {
    const errors: string[] = [];

    if (!dto.contratId) {
      errors.push('L\'identifiant du contrat est obligatoire');
    }

    if (!dto.compteurId) {
      errors.push('L\'identifiant du compteur est obligatoire');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Erreurs de validation assignation: ${errors.join(', ')}`, 'validation', 'VALIDATION_ERROR');
    }
  }

  // === VALIDATION FINALISATION ===
  static async validateFinalization(contratId: string, tenantId: string): Promise<void> {
    const repository = new ContratRepository();
    const contrat = await repository.findByIdWithTenant(contratId, tenantId);
    
    if (!contrat) {
      throw new ValidationError('Contrat non trouvé', 'contratId', 'CONTRAT_NOT_FOUND');
    }

    const errors: string[] = [];

    // Vérifier que le contrat est en attente
    if (contrat.statut !== 'EN_ATTENTE') {
      errors.push('Seuls les contrats en attente peuvent être finalisés');
    }

    // Vérifier qu'il y a un compteur actif lié
    const compteurs = await repository.getCompteursByContrat(contratId, tenantId);
    const compteurActif = compteurs.find(c => c.statut === 'ACTIF');
    if (!compteurActif) {
      errors.push('Le contrat doit avoir au moins un compteur actif lié');
    }

    // Vérifier que tous les cosignataires ont signé (seulement s'il y en a)
    const cosignataires = await repository.getCosignatairesByContrat(contratId, tenantId);
    if (cosignataires && cosignataires.length > 0) {
      const cosignatairesNonSignes = cosignataires.filter(c => c.statutSignature !== 'SIGNE');
      if (cosignatairesNonSignes.length > 0) {
        errors.push('Tous les cosignataires doivent avoir signé le contrat');
      }
    }
    // Les cosignataires sont désormais optionnels - aucune validation n'est nécessaire s'il n'y en a pas

    // Vérifier que le contrat n'est pas déjà actif ou résilié
    if (['ACTIF', 'ANNULE', 'TERMINE'].includes(contrat.statut)) {
      errors.push('Le contrat ne peut pas être finalisé dans son état actuel');
    }

    // Vérifier le format du numéro métier (si déjà généré)
    if (contrat.numero && !contrat.numero.startsWith('DRAFT_')) {
      const numeroPattern = /^[IPC][A-Z]{3}\d{2}\d{6}$/;
      if (!numeroPattern.test(contrat.numero)) {
        errors.push('Le numéro de contrat ne respecte pas le format métier attendu');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(`Erreurs de validation finalisation: ${errors.join(', ')}`, 'finalization', 'FINALIZATION_ERROR');
    }
  }

  // === VALIDATION MODIFICATION ===
  static validateUpdate(dto: UpdateContratDto, contratExistant: any): void {
    const errors: string[] = [];

    // Vérifier que le contrat peut être modifié
    if (!['EN_ATTENTE', 'ACTIF'].includes(contratExistant.statut)) {
      throw new ValidationError(
        'Le contrat ne peut pas être modifié dans son état actuel',
        'statut',
        'CONTRAT_NOT_MODIFIABLE'
      );
    }

    // Validation de la date de fin si fournie
    if (dto.dateFin) {
      const dateFin = new Date(dto.dateFin);
      const dateDebut = new Date(contratExistant.dateDebut);
      
      if (dateFin <= dateDebut) {
        errors.push('La date de fin doit être postérieure à la date de début');
      }

      // La durée du contrat ne peut pas dépasser 20 ans
      const dureeMax = new Date(dateDebut);
      dureeMax.setFullYear(dureeMax.getFullYear() + 20);
      if (dateFin > dureeMax) {
        errors.push('La durée du contrat ne peut pas dépasser 20 ans');
      }
    }

    // Validation du montant total
    if (dto.montantTotal !== undefined) {
      if (dto.montantTotal < 0) {
        errors.push('Le montant total ne peut pas être négatif');
      }
      if (dto.montantTotal > 1000000) {
        errors.push('Le montant total ne peut pas dépasser 1 000 000€');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(`Erreurs de validation: ${errors.join(', ')}`, 'validation', 'VALIDATION_ERROR');
    }
  }

  // === VALIDATION SIGNATURE ===
  static validateSignature(dto: SignatureContratDto, contrat: any): void {
    if (contrat.statut !== 'ACTIF') {
      throw new ValidationError(
        'Seuls les contrats actifs peuvent être signés',
        'statut',
        'CONTRAT_NOT_SIGNABLE'
      );
    }

    if (contrat.statutSignature === 'SIGNE') {
      throw new ValidationError(
        'Le contrat est déjà signé',
        'statutSignature',
        'CONTRAT_ALREADY_SIGNED'
      );
    }

    if (!dto.signatureElectronique && !dto.signatureManuelle) {
      throw new ValidationError(
        'Une signature électronique ou manuelle est requise',
        'signature',
        'SIGNATURE_REQUIRED'
      );
    }

    if (dto.signatureElectronique && !dto.certificatSignature) {
      throw new ValidationError(
        'Un certificat de signature est requis pour la signature électronique',
        'certificatSignature',
        'CERTIFICAT_REQUIRED'
      );
    }
  }

  // === VALIDATION RÉSILIATION ===
  static validateResiliation(dto: ResiliationContratDto, contrat: any): void {
    if (contrat.statut === 'RESILIE') {
      throw new ValidationError(
        'Le contrat est déjà résilié',
        'statut',
        'CONTRAT_ALREADY_TERMINATED'
      );
    }

    if (!['ACTIF', 'SUSPENDU'].includes(contrat.statut)) {
      throw new ValidationError(
        'Seuls les contrats actifs ou suspendus peuvent être résiliés',
        'statut',
        'CONTRAT_NOT_TERMINABLE'
      );
    }

    if (!dto.motifResiliation || dto.motifResiliation.trim().length < 10) {
      throw new ValidationError(
        'Le motif de résiliation doit contenir au moins 10 caractères',
        'motifResiliation',
        'MOTIF_TOO_SHORT'
      );
    }

    if (dto.dateResiliation) {
      const dateResiliation = new Date(dto.dateResiliation);
      const aujourdhui = new Date();
      
      if (dateResiliation < aujourdhui) {
        throw new ValidationError(
          'La date de résiliation ne peut pas être dans le passé',
          'dateResiliation',
          'DATE_INVALID'
        );
      }
    }
  }

  // === VALIDATION SUSPENSION ===
  static validateSuspension(dto: SuspensionContratDto, contrat: any): void {
    if (contrat.statut === 'SUSPENDU') {
      throw new ValidationError(
        'Le contrat est déjà suspendu',
        'statut',
        'CONTRAT_ALREADY_SUSPENDED'
      );
    }

    if (contrat.statut !== 'ACTIF') {
      throw new ValidationError(
        'Seuls les contrats actifs peuvent être suspendus',
        'statut',
        'CONTRAT_NOT_SUSPENDABLE'
      );
    }

    if (!dto.motifSuspension || dto.motifSuspension.trim().length < 10) {
      throw new ValidationError(
        'Le motif de suspension doit contenir au moins 10 caractères',
        'motifSuspension',
        'MOTIF_TOO_SHORT'
      );
    }

    if (dto.dateSuspension) {
      const dateSuspension = new Date(dto.dateSuspension);
      const aujourdhui = new Date();
      
      if (dateSuspension < aujourdhui) {
        throw new ValidationError(
          'La date de suspension ne peut pas être dans le passé',
          'dateSuspension',
          'DATE_INVALID'
        );
      }
    }
  }

  // === VALIDATION RENOUVELLEMENT ===
  static validateRenouvellement(dto: RenouvellementContratDto, contrat: any): void {
    if (!['ACTIF', 'TERMINE'].includes(contrat.statut)) {
      throw new ValidationError(
        'Seuls les contrats actifs ou terminés peuvent être renouvelés',
        'statut',
        'CONTRAT_NOT_RENEWABLE'
      );
    }

    if (!dto.nouvelleDateFin) {
      throw new ValidationError(
        'La nouvelle date de fin est obligatoire',
        'nouvelleDateFin',
        'DATE_REQUIRED'
      );
    }

    const nouvelleDateFin = new Date(dto.nouvelleDateFin);
    const aujourdhui = new Date();
    
    if (nouvelleDateFin <= aujourdhui) {
      throw new ValidationError(
        'La nouvelle date de fin doit être dans le futur',
        'nouvelleDateFin',
        'DATE_INVALID'
      );
    }

    // La durée du renouvellement ne peut pas dépasser 20 ans
    const dureeMax = new Date();
    dureeMax.setFullYear(dureeMax.getFullYear() + 20);
    if (nouvelleDateFin > dureeMax) {
      throw new ValidationError(
        'La durée du renouvellement ne peut pas dépasser 20 ans',
        'nouvelleDateFin',
        'DURATION_TOO_LONG'
      );
    }
  }

  // === VALIDATION COSIGNATAIRES ===
  private static validateCosignataires(cosignataires: CreateCosignataireDto[], errors: string[]): void {
    // Si le tableau est vide ou undefined, il n'y a rien à valider - les cosignataires sont optionnels
    if (!cosignataires || cosignataires.length === 0) {
      return;
    }
    
    const cosignataireIds = new Set<string>();
    let totalPourcentage = 0;

    for (let i = 0; i < cosignataires.length; i++) {
      const cos = cosignataires[i];
      
      // Ignorer les cosignataires sans ID ou email (optionnels)
      if (!cos.cosignataireId && !cos.emailCosignataire) {
        continue;
      }

      // Vérifier l'unicité des cosignataires
      if (cos.cosignataireId && cosignataireIds.has(cos.cosignataireId)) {
        errors.push(`Le cosignataire ${cos.cosignataireId} est dupliqué`);
      }
      if (cos.cosignataireId) {
        cosignataireIds.add(cos.cosignataireId);
      }

      // Validation du type
      if (cos.typeCosignataire && !['UTILISATEUR', 'ENTREPRISE'].includes(cos.typeCosignataire)) {
        errors.push(`Type de cosignataire invalide pour l'index ${i}`);
      }

      // Validation du rôle
      if (cos.roleType && !['PRINCIPAL', 'SECONDARY'].includes(cos.roleType)) {
        errors.push(`Rôle de cosignataire invalide pour l'index ${i}`);
      }

      // Validation du pourcentage
      if (cos.pourcentageParts !== undefined) {
        if (cos.pourcentageParts < 0 || cos.pourcentageParts > 100) {
          errors.push(`Pourcentage invalide pour l'index ${i} (doit être entre 0 et 100)`);
        }
        totalPourcentage += cos.pourcentageParts;
      }

      // Validation de l'email
      if (cos.emailCosignataire && !this.isValidEmail(cos.emailCosignataire)) {
        errors.push(`Email invalide pour l'index ${i}`);
      }

      // Validation du téléphone
      if (cos.telephoneCosignataire && !this.isValidPhone(cos.telephoneCosignataire)) {
        errors.push(`Téléphone invalide pour l'index ${i}`);
      }
    }

    // Vérifier que le total des pourcentages ne dépasse pas 100%
    if (totalPourcentage > 100) {
      errors.push('Le total des pourcentages des cosignataires ne peut pas dépasser 100%');
    }

    // Vérifier qu'il y a au moins un cosignataire principal n'est plus nécessaire
    // car les cosignataires sont maintenant optionnels
    /*
    const hasPrincipal = cosignataires.some(cos => cos.roleType === 'PRINCIPAL');
    if (!hasPrincipal) {
      errors.push('Au moins un cosignataire principal est requis');
    }
    */
  }

  // === VALIDATION EMAIL ===
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // === VALIDATION TÉLÉPHONE ===
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // === VALIDATION GÉNÉRALE ===
  static validateContratExists(contrat: any, contratId: string): void {
    if (!contrat) {
      throw new ValidationError(
        `Contrat avec l'ID ${contratId} non trouvé`,
        'contratId',
        'CONTRAT_NOT_FOUND'
      );
    }
  }

  static validateTenantAccess(contrat: any, tenantId: string): void {
    if (contrat.tenantId !== tenantId) {
      throw new ValidationError(
        'Accès non autorisé à ce contrat',
        'tenantId',
        'ACCESS_DENIED'
      );
    }
  }

  // === VALIDATION DES RÈGLES MÉTIER SPÉCIFIQUES ===
  private static validateMetierBusinessRules(dto: CreateContratMetierDto, errors: string[]): void {
    // Règle 1: Les contrats de type 'A' (Administration) ne peuvent pas avoir de cosignataires
    if (dto.typeContrat === 'A' && dto.cosignataires && dto.cosignataires.length > 0) {
      errors.push('Les contrats de type Administration ne peuvent pas avoir de cosignataires');
    }

    // Règle 2: Les contrats de type 'C' (Collectivité) doivent avoir au moins un cosignataire
    if (dto.typeContrat === 'C' && (!dto.cosignataires || dto.cosignataires.length === 0)) {
      errors.push('Les contrats de type Collectivité doivent avoir au moins un cosignataire');
    }

    // Règle 3: Les contrats de type 'I' (Individuel) ne peuvent pas avoir plus d'un cosignataire
    if (dto.typeContrat === 'I' && dto.cosignataires && dto.cosignataires.length > 1) {
      errors.push('Les contrats de type Individuel ne peuvent pas avoir plus d\'un cosignataire');
    }

    // Règle 4: Validation du montant selon le type de contrat
    if (dto.montantTotal !== undefined) {
      switch (dto.typeContrat) {
        case 'I':
          if (dto.montantTotal > 50000) {
            errors.push('Le montant d\'un contrat Individuel ne peut pas dépasser 50 000€');
          }
          break;
        case 'P':
          if (dto.montantTotal > 200000) {
            errors.push('Le montant d\'un contrat Particulier ne peut pas dépasser 200 000€');
          }
          break;
        case 'C':
          if (dto.montantTotal > 1000000) {
            errors.push('Le montant d\'un contrat Collectivité ne peut pas dépasser 1 000 000€');
          }
          break;
        case 'A':
          if (dto.montantTotal > 5000000) {
            errors.push('Le montant d\'un contrat Administration ne peut pas dépasser 5 000 000€');
          }
          break;
      }
    }
  }
} 