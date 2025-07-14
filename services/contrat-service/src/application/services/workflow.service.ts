import { Injectable } from '@nestjs/common';
import { ContratError, ErrorCode } from '../errors/contrat.errors';

export type ContratState = 
  | 'EN_ATTENTE' 
  | 'ACTIF' 
  | 'SUSPENDU' 
  | 'ANNULE' 
  | 'TERMINE' 
  | 'RESILIE';

export type SignatureState = 'EN_ATTENTE' | 'SIGNE' | 'REFUSE';

export interface StateTransition {
  from: ContratState;
  to: ContratState;
  action: string;
  conditions: string[];
  validations: string[];
  notifications: string[];
  auditActions: string[];
}

export interface WorkflowContext {
  contratId: string;
  userId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class WorkflowService {
  
  // === DÉFINITION DES TRANSITIONS ===
  private readonly stateTransitions: StateTransition[] = [
    // Création → En attente
    {
      from: null,
      to: 'EN_ATTENTE',
      action: 'CREATION',
      conditions: ['proprietaireValide', 'donneesCompletes'],
      validations: ['validationMetier', 'validationInterServices'],
      notifications: ['notificationCreation'],
      auditActions: ['auditCreation']
    },

    // En attente → Actif (après signature)
    {
      from: 'EN_ATTENTE',
      to: 'ACTIF',
      action: 'ACTIVATION',
      conditions: ['signatureComplete', 'cosignatairesSignes'],
      validations: ['validationSignature', 'validationCosignataires'],
      notifications: ['notificationActivation'],
      auditActions: ['auditActivation']
    },

    // Actif → Suspendu
    {
      from: 'ACTIF',
      to: 'SUSPENDU',
      action: 'SUSPENSION',
      conditions: ['motifSuspensionValide', 'dateSuspensionValide'],
      validations: ['validationSuspension'],
      notifications: ['notificationSuspension'],
      auditActions: ['auditSuspension']
    },

    // Suspendu → Actif (réactivation)
    {
      from: 'SUSPENDU',
      to: 'ACTIF',
      action: 'REACTIVATION',
      conditions: ['motifReactivationValide'],
      validations: ['validationReactivation'],
      notifications: ['notificationReactivation'],
      auditActions: ['auditReactivation']
    },

    // Actif → Résilié
    {
      from: 'ACTIF',
      to: 'RESILIE',
      action: 'RESILIATION',
      conditions: ['motifResiliationValide', 'dateResiliationValide'],
      validations: ['validationResiliation'],
      notifications: ['notificationResiliation'],
      auditActions: ['auditResiliation']
    },

    // Suspendu → Résilié
    {
      from: 'SUSPENDU',
      to: 'RESILIE',
      action: 'RESILIATION',
      conditions: ['motifResiliationValide', 'dateResiliationValide'],
      validations: ['validationResiliation'],
      notifications: ['notificationResiliation'],
      auditActions: ['auditResiliation']
    },

    // Actif → Terminé (expiration)
    {
      from: 'ACTIF',
      to: 'TERMINE',
      action: 'EXPIRATION',
      conditions: ['dateFinAtteinte'],
      validations: ['validationExpiration'],
      notifications: ['notificationExpiration'],
      auditActions: ['auditExpiration']
    },

    // En attente → Annulé
    {
      from: 'EN_ATTENTE',
      to: 'ANNULE',
      action: 'ANNULATION',
      conditions: ['motifAnnulationValide'],
      validations: ['validationAnnulation'],
      notifications: ['notificationAnnulation'],
      auditActions: ['auditAnnulation']
    }
  ];

  // === VALIDATION DE TRANSITION ===
  async validateTransition(
    currentState: ContratState,
    targetState: ContratState,
    action: string,
    context: WorkflowContext
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Trouver la transition appropriée
    const transition = this.findTransition(currentState, targetState, action);
    
    if (!transition) {
      errors.push(`Transition non autorisée de ${currentState} vers ${targetState} avec l'action ${action}`);
      return { isValid: false, errors, warnings };
    }

    // Vérifier les conditions
    for (const condition of transition.conditions) {
      const conditionResult = await this.evaluateCondition(condition, context);
      if (!conditionResult.isValid) {
        errors.push(conditionResult.error);
      }
    }

    // Vérifier les validations
    for (const validation of transition.validations) {
      const validationResult = await this.evaluateValidation(validation, context);
      if (!validationResult.isValid) {
        errors.push(validationResult.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // === EXÉCUTION DE TRANSITION ===
  async executeTransition(
    currentState: ContratState,
    targetState: ContratState,
    action: string,
    context: WorkflowContext
  ): Promise<{ success: boolean; newState: ContratState; auditTrail: any[]; notifications: any[] }> {
    
    // Valider la transition
    const validation = await this.validateTransition(currentState, targetState, action, context);
    
    if (!validation.isValid) {
      throw new ContratError(
        `Transition invalide: ${validation.errors.join(', ')}`,
        ErrorCode.INVALID_STATE_TRANSITION,
        422,
        { 
          currentState, 
          targetState, 
          action, 
          errors: validation.errors 
        }
      );
    }

    const transition = this.findTransition(currentState, targetState, action);
    const auditTrail: any[] = [];
    const notifications: any[] = [];

    try {
      // Exécuter les actions d'audit
      for (const auditAction of transition.auditActions) {
        const auditResult = await this.executeAuditAction(auditAction, context);
        auditTrail.push(auditResult);
      }

      // Exécuter les notifications
      for (const notification of transition.notifications) {
        const notificationResult = await this.executeNotification(notification, context);
        notifications.push(notificationResult);
      }

      return {
        success: true,
        newState: targetState,
        auditTrail,
        notifications
      };

    } catch (error) {
      throw new ContratError(
        `Erreur lors de l'exécution de la transition: ${error.message}`,
        ErrorCode.INVALID_STATE_TRANSITION,
        500,
        { 
          currentState, 
          targetState, 
          action, 
          originalError: error.message 
        }
      );
    }
  }

  // === ÉVALUATION DES CONDITIONS ===
  private async evaluateCondition(condition: string, context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    switch (condition) {
      case 'proprietaireValide':
        return await this.validateProprietaire(context);
      
      case 'donneesCompletes':
        return await this.validateDonneesCompletes(context);
      
      case 'signatureComplete':
        return await this.validateSignatureComplete(context);
      
      case 'cosignatairesSignes':
        return await this.validateCosignatairesSignes(context);
      
      case 'motifSuspensionValide':
        return await this.validateMotifSuspension(context);
      
      case 'dateSuspensionValide':
        return await this.validateDateSuspension(context);
      
      case 'motifReactivationValide':
        return await this.validateMotifReactivation(context);
      
      case 'motifResiliationValide':
        return await this.validateMotifResiliation(context);
      
      case 'dateResiliationValide':
        return await this.validateDateResiliation(context);
      
      case 'dateFinAtteinte':
        return await this.validateDateFinAtteinte(context);
      
      case 'motifAnnulationValide':
        return await this.validateMotifAnnulation(context);
      
      default:
        return { isValid: false, error: `Condition non reconnue: ${condition}` };
    }
  }

  // === ÉVALUATION DES VALIDATIONS ===
  private async evaluateValidation(validation: string, context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    switch (validation) {
      case 'validationMetier':
        return await this.validateMetier(context);
      
      case 'validationInterServices':
        return await this.validateInterServices(context);
      
      case 'validationSignature':
        return await this.validateSignature(context);
      
      case 'validationCosignataires':
        return await this.validateCosignataires(context);
      
      case 'validationSuspension':
        return await this.validateSuspension(context);
      
      case 'validationReactivation':
        return await this.validateReactivation(context);
      
      case 'validationResiliation':
        return await this.validateResiliation(context);
      
      case 'validationExpiration':
        return await this.validateExpiration(context);
      
      case 'validationAnnulation':
        return await this.validateAnnulation(context);
      
      default:
        return { isValid: false, error: `Validation non reconnue: ${validation}` };
    }
  }

  // === EXÉCUTION DES ACTIONS D'AUDIT ===
  private async executeAuditAction(auditAction: string, context: WorkflowContext): Promise<any> {
    // Implémentation des actions d'audit
    return {
      action: auditAction,
      timestamp: new Date().toISOString(),
      context
    };
  }

  // === EXÉCUTION DES NOTIFICATIONS ===
  private async executeNotification(notification: string, context: WorkflowContext): Promise<any> {
    // Implémentation des notifications
    return {
      notification,
      timestamp: new Date().toISOString(),
      context
    };
  }

  // === TROUVER LA TRANSITION ===
  private findTransition(from: ContratState, to: ContratState, action: string): StateTransition | null {
    return this.stateTransitions.find(t => 
      t.from === from && 
      t.to === to && 
      t.action === action
    ) || null;
  }

  // === VALIDATIONS SPÉCIFIQUES ===
  private async validateProprietaire(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation du propriétaire
    return { isValid: true };
  }

  private async validateDonneesCompletes(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation des données complètes
    return { isValid: true };
  }

  private async validateSignatureComplete(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de la signature complète
    return { isValid: true };
  }

  private async validateCosignatairesSignes(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation des cosignataires signés
    return { isValid: true };
  }

  private async validateMotifSuspension(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation du motif de suspension
    return { isValid: true };
  }

  private async validateDateSuspension(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de la date de suspension
    return { isValid: true };
  }

  private async validateMotifReactivation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation du motif de réactivation
    return { isValid: true };
  }

  private async validateMotifResiliation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation du motif de résiliation
    return { isValid: true };
  }

  private async validateDateResiliation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de la date de résiliation
    return { isValid: true };
  }

  private async validateDateFinAtteinte(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de la date de fin atteinte
    return { isValid: true };
  }

  private async validateMotifAnnulation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation du motif d'annulation
    return { isValid: true };
  }

  private async validateMetier(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation métier
    return { isValid: true };
  }

  private async validateInterServices(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation inter-services
    return { isValid: true };
  }

  private async validateSignature(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de signature
    return { isValid: true };
  }

  private async validateCosignataires(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation des cosignataires
    return { isValid: true };
  }

  private async validateSuspension(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de suspension
    return { isValid: true };
  }

  private async validateReactivation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de réactivation
    return { isValid: true };
  }

  private async validateResiliation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation de résiliation
    return { isValid: true };
  }

  private async validateExpiration(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation d'expiration
    return { isValid: true };
  }

  private async validateAnnulation(context: WorkflowContext): Promise<{ isValid: boolean; error?: string }> {
    // Logique de validation d'annulation
    return { isValid: true };
  }

  // === UTILITAIRES ===
  getAvailableTransitions(currentState: ContratState): StateTransition[] {
    return this.stateTransitions.filter(t => t.from === currentState);
  }

  getStateHistory(contratId: string): any[] {
    // Récupérer l'historique des états d'un contrat
    return [];
  }

  isFinalState(state: ContratState): boolean {
    return ['TERMINE', 'RESILIE', 'ANNULE'].includes(state);
  }

  canTransition(from: ContratState, to: ContratState): boolean {
    return this.stateTransitions.some(t => t.from === from && t.to === to);
  }
} 