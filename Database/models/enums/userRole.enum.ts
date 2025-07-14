/**
 * Énumération des rôles utilisateur dans le système
 * Utilisée pour le contrôle d'accès basé sur les rôles (RBAC)
 */
export enum UserRole {
  // Rôles administratifs
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  
  // Rôles opérationnels
  DIRECTEUR = 'DIRECTEUR',
  COMMERCIAL = 'COMMERCIAL',
  COMPTABLE = 'COMPTABLE',
  TECHNICIEN = 'TECHNICIEN',
  INTERVENANT_EXTERNE = 'INTERVENANT_EXTERNE',
  SUPPORT_CLIENT = 'SUPPORT_CLIENT',
  MANAGER = 'MANAGER',  // Conservation du rôle existant
  
  // Rôles en lecture seule
  AUDITEUR = 'AUDITEUR',
  CONSULTANT = 'CONSULTANT',

  // Compatibilité avec les rôles existants
  CLIENT = 'CLIENT',
  SUPPORT = 'SUPPORT'
}
